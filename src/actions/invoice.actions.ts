// src/actions/invoice.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import Invoice, { IInvoice } from "@/lib/models/invoice";
import Customer from "@/lib/models/customer";
import { getUserModel } from "@/lib/models/user";
import { connectToDatabase } from "@/lib/db";
import Variant, { IVariant } from "@/lib/models/variant";
import Product, { IProduct } from "@/lib/models/product";
import { Types } from "mongoose";
import { z } from "zod";

// --- NEW CODE: Correctly define the interface for populated variant ---
interface IVariantWithPopulatedProduct extends Omit<IVariant, "product"> {
  product: IProduct;
}
// --------------------------------------------------------------------------

export type InvoiceDataPayload = {
  customerId: string;
  billedById: string;
  items: {
    variantId: string;
    name: string;
    price: number;
    quantity: number;
    mrp: number;
    gstRate: number;
    hsn?: string;
  }[];
  subtotal: number;
  discount: number;
  packingChargeDiscount: number;
  gstAmount: number;
  totalPayable: number;
  paymentMethod: "cash" | "upi" | "card";
};

async function generateInvoiceNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);

  const lastInvoice = await Invoice.findOne({
    createdAt: { $gte: startOfYear, $lt: endOfYear },
  }).sort({ createdAt: -1 });

  let nextSequence = 1;

  if (lastInvoice && lastInvoice.invoiceNumber) {
    const parts = lastInvoice.invoiceNumber.split("-");

    if (parts.length === 5 && parts[0] === "INV" && parts[1] === "RS") {
      const lastSequence = parseInt(parts[2], 10);
      if (!isNaN(lastSequence)) {
        nextSequence = lastSequence + 1;
      }
    }
  }

  const paddedSequence = String(nextSequence).padStart(6, "0");
  const paddedMonth = String(month).padStart(2, "0");

  return `INV-RS-${paddedSequence}-${paddedMonth}-${year}`;
}

// --------------------------------------------------------------------------
// 🧾 Create Invoice
// --------------------------------------------------------------------------
export async function createInvoice(invoiceData: InvoiceDataPayload) {
  try {
    await connectToDatabase();

    const invoiceNumber = await generateInvoiceNumber();

    // NEW CODE: Normalize items to ensure variantId is a clean string/ObjectId before Mongoose saves it.
    const normalizedItems = invoiceData.items.map(item => {
        let variantIdString = item.variantId;
        
        // This handles cases where client-side code might accidentally send { $oid: '...' }
        if (item.variantId && typeof item.variantId === 'object' && '$oid' in item.variantId) {
             variantIdString = (item.variantId as any).$oid;
        }

        return {
            ...item,
            variantId: variantIdString, 
        };
    });
    // END NEW CODE

    const newInvoice = new Invoice({
      invoiceNumber,
      customer: invoiceData.customerId,
      billedBy: invoiceData.billedById,
      items: normalizedItems, // MODIFIED: Use normalized items
      subtotal: invoiceData.subtotal,
      discount: invoiceData.discount,
      packingChargeDiscount: invoiceData.packingChargeDiscount,
      gstAmount: invoiceData.gstAmount,
      totalPayable: invoiceData.totalPayable,
      paymentMethod: invoiceData.paymentMethod,
    });

    const savedInvoice = await newInvoice.save();

    revalidatePath("/admin/invoice");
    revalidatePath("/cashier/invoice");

    return { success: true, data: JSON.parse(JSON.stringify(savedInvoice)) };
  } catch (error: any) {
    console.error("❌ Create invoice action error:", error);
    return { success: false, message: error.message };
  }
}

// --------------------------------------------------------------------------
// 🧾 Get All Invoices
// --------------------------------------------------------------------------
export async function getInvoices(): Promise<{
  success: boolean;
  data?: IInvoice[];
  message?: string;
}> {
  try {
    await connectToDatabase();
    const User = getUserModel();
    const invoices = await Invoice.find({})
      .populate({ path: "customer", model: Customer, select: "name phone" })
      .populate({ path: "billedBy", model: User, select: "name" })
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(invoices)) };
  } catch (error: any) {
    console.error("❌ Fetch invoices error:", error);
    return { success: false, message: error.message };
  }
}

// --------------------------------------------------------------------------
// 🧾 Cancel Invoice
// --------------------------------------------------------------------------
export async function cancelInvoice(invoiceId: string) {
  try {
    await connectToDatabase();
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      { status: "cancelled" },
      { new: true }
    );

    if (!updatedInvoice) {
      throw new Error("Invoice not found.");
    }

    revalidatePath("/admin/invoice");
    revalidatePath("/cashier/invoice");

    return { success: true, data: JSON.parse(JSON.stringify(updatedInvoice)) };
  } catch (error: any) {
    console.error("❌ Cancel invoice error:", error);
    return { success: false, message: error.message };
  }
}

// --------------------------------------------------------------------------
// 🧾 Count Invoices by Customer
// --------------------------------------------------------------------------
export const getInvoiceCountByCustomer = async (customerId: string) => {
  try {
    await connectToDatabase();
    const count = await Invoice.countDocuments({ customer: customerId });
    return { success: true, data: count };
  } catch (error: any) {
    console.error("❌ Failed to fetch invoice count:", error);
    return { success: false, message: "Failed to fetch invoice count." };
  }
};

// --------------------------------------------------------------------------
// 💰 FINANCIAL METRICS CALCULATION (NEW FUNCTION)
// --------------------------------------------------------------------------
export async function getFinancialMetrics() {
  try {
    await connectToDatabase();

    // 1. Fetch invoices
    const invoices = await Invoice.find({ status: { $ne: "cancelled" } })
      .select("invoiceNumber items createdAt")
      .lean();

    let totalProfit = 0;
    // MODIFICATION: Initialize all charges to zero for accumulation
    const totalDepositableCharges = {
      packingCharges: 0,
      laborCharges: 0,
      electricityCharges: 0,
      oecCharges: 0,
    };

    // 🧮 Calculate Profit and Deposits
    for (const invoice of invoices) {
      for (const item of invoice.items) {
        if (!item.variantId) continue;

        // MODIFICATION: Populate 'product' and select both 'purchasePrice' AND 'sellingPrice'
        const variantData = await Variant.findById(item.variantId)
          .populate<{ product: IProduct }>({
            path: "product",
            model: Product,
            select: "purchasePrice sellingPrice", // MODIFIED: Include sellingPrice
          })
          .lean();

        const variant = variantData as IVariantWithPopulatedProduct | null;

        if (!variant || !variant.product) continue;

        // --- Data retrieval ---
        const purchasePrice = variant.product.purchasePrice || 0;
        const sellingPrice = variant.product.sellingPrice || 0; // NEW: Retrieve sellingPrice
        const unitConsumed = variant.unitConsumed || 0;
        const others2 = variant.others2 || 0;
        const itemQuantity = item.quantity;
        const itemRevenue = item.price * itemQuantity;

       // --- Profit Calculation (MODIFIED FORMULA AS REQUESTED) ---
        
        // 1. Price Difference: selling price - purchase price
        const priceDifference = sellingPrice - purchasePrice; 

        // 2. Quantity Calculation: priceDifference * unitConsumed
        const quantityCalc = priceDifference * unitConsumed;

        // 3. Item Profit Per Unit (The calculated Net Profit per unit consumed)
        // const itemProfitPerUnit = quantityCalc + others2;
        const itemProfitPerUnit = quantityCalc + others2 ;
        
        // Total Profit = (Profit Per Unit) * Item Quantity Sold
        const itemProfit = itemProfitPerUnit ;
        // const itemProfit = itemProfitPerUnit * itemQuantity;
        
        totalProfit += itemProfit;

        // --- Deposit Calculation (Accumulate Charges) ---
        // NEW CODE: Accumulate total depositable charges based on item quantity
        totalDepositableCharges.packingCharges +=
          (variant.packingCharges || 0) * itemQuantity;
        totalDepositableCharges.laborCharges +=
          (variant.laborCharges || 0) * itemQuantity;
        totalDepositableCharges.electricityCharges +=
          (variant.electricityCharges || 0) * itemQuantity;
        totalDepositableCharges.oecCharges +=
          (variant.others1 || 0) * itemQuantity;
        // END NEW CODE
      }
    }

    // Sum the accumulated charges for the main 'Total Deposits' card
    const totalDeposits = Object.values(totalDepositableCharges).reduce(
      (sum, val) => sum + val,
      0
    );

    return {
      success: true,
      data: {
        totalProfit,
        totalDeposits,
        // The breakdown object is now part of the successful return data
        depositableCharges: totalDepositableCharges, 
      },
    };
  } catch (error: any) {
    console.error("❌ [getFinancialMetrics] Error:", error);
    return { success: false, message: error.message };
  }
}