"use server";

import { revalidatePath } from "next/cache";
import Invoice, { IInvoice } from "@/lib/models/invoice";
import Customer from "@/lib/models/customer";
import { getUserModel } from "@/lib/models/user";
import { connectToDatabase } from "@/lib/db";
// This is an example, you would need to create this utility function
// to generate sequential invoice numbers (e.g., INV-0001, INV-0002).
// import { getNextInvoiceNumber } from "@/lib/utils"; 

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

export async function createInvoice(invoiceData: InvoiceDataPayload) {
  try {
    await connectToDatabase();
    
    // Example: const invoiceNumber = await getNextInvoiceNumber();
    const invoiceNumber = `INV-${Date.now()}`; // Placeholder

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