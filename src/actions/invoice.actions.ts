"use server";

import { revalidatePath } from "next/cache";
import Invoice, { IInvoice } from "@/lib/models/invoice";
import Customer from "@/lib/models/customer";
import { getUserModel } from "@/lib/models/user";
import { connectToDatabase } from "@/lib/db";

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
  paymentMethod: 'cash' | 'upi' | 'card';
};

async function generateInvoiceNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // getMonth() is 0-indexed

  // Define the start and end of the current year for the query
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);

  // Find the last invoice created within the current year
  const lastInvoice = await Invoice.findOne({
    createdAt: { $gte: startOfYear, $lt: endOfYear }
  }).sort({ createdAt: -1 });

  let nextSequence = 1;

  if (lastInvoice && lastInvoice.invoiceNumber) {
    // ✅ Add a check to ensure the invoice number is in the new format before parsing
    const parts = lastInvoice.invoiceNumber.split('-');
    
    // The new format "INV-RS-000001-10-2025" has 5 parts
    if (parts.length === 5 && parts[0] === 'INV' && parts[1] === 'RS') {
      const lastSequence = parseInt(parts[2], 10);
      // Additional check to make sure parsing was successful
      if (!isNaN(lastSequence)) {
        nextSequence = lastSequence + 1;
      }
    }
    // If the format is old (e.g., "INV-123456789"), the condition fails
    // and nextSequence correctly remains 1.
  }
  
  // Pad the numbers with leading zeros to match the desired format
  const paddedSequence = String(nextSequence).padStart(6, '0');
  const paddedMonth = String(month).padStart(2, '0');
  
  return `INV-RS-${paddedSequence}-${paddedMonth}-${year}`;
}


export async function createInvoice(invoiceData: InvoiceDataPayload) {
  try {
    await connectToDatabase();
    
    // Generate the new structured invoice number
    const invoiceNumber = await generateInvoiceNumber();

    const newInvoice = new Invoice({
      invoiceNumber,
      customer: invoiceData.customerId,
      billedBy: invoiceData.billedById,
      items: invoiceData.items,
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
    console.error("Create invoice action error:", error);
    return { success: false, message: error.message };
  }
}

export async function getInvoices(): Promise<{ success: boolean; data?: IInvoice[]; message?: string; }> {
  try {
    await connectToDatabase();
    const User = getUserModel(); // Ensure User model is registered
    const invoices = await Invoice.find({})
      .populate({ path: 'customer', model: Customer, select: 'name phone' })
      .populate({ path: 'billedBy', model: User, select: 'name' })
      .sort({ createdAt: -1 })
      .lean();
    return { success: true, data: JSON.parse(JSON.stringify(invoices)) };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function cancelInvoice(invoiceId: string) {
  try {
    await connectToDatabase();
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      { status: 'cancelled' },
      { new: true }
    );

    if (!updatedInvoice) {
      throw new Error("Invoice not found.");
    }
    
    revalidatePath("/admin/invoice");
    revalidatePath("/cashier/invoice");
    
    return { success: true, data: JSON.parse(JSON.stringify(updatedInvoice)) };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export const getInvoiceCountByCustomer = async (customerId: string) => {
  try {
    await connectToDatabase();
    const count = await Invoice.countDocuments({ customer: customerId });
    return { success: true, data: count };
  } catch (error: any) {
    console.error("Failed to fetch invoice count:", error);
    return { success: false, message: "Failed to fetch invoice count." };
  }
};