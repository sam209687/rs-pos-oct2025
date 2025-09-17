"use server";

import { revalidatePath } from "next/cache";
import Invoice, { IInvoice } from "@/lib/models/invoice";
import { connectToDatabase } from "@/lib/db";

// This is the data structure we'll send from the client
export type InvoiceDataPayload = {
  customerId: string;
  items: any[]; // A simplified version of cart items
  subtotal: number;
  discount: number;
  packingChargeDiscount: number;
  gstAmount: number;
  totalPayable: number;
  paymentMethod: 'cash' | 'upi' | 'card';
};

export async function createInvoice(invoiceData: InvoiceDataPayload) {
  try {
    // In a real app, you'd get the full URL from environment variables
    const response = await fetch('http://localhost:3000/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: invoiceData.customerId,
        items: invoiceData.items,
        subtotal: invoiceData.subtotal,
        discount: invoiceData.discount,
        packingChargeDiscount: invoiceData.packingChargeDiscount,
        gstAmount: invoiceData.gstAmount,
        totalPayable: invoiceData.totalPayable,
        paymentMethod: invoiceData.paymentMethod,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create invoice.");
    }

    const savedInvoice: IInvoice = await response.json();
    revalidatePath("/admin/invoices"); // Assuming you'll have an invoices page

    return { success: true, data: savedInvoice };

  } catch (error: any) {
    console.error("Create invoice action error:", error);
    return { success: false, message: error.message };
  }
}

export const getInvoiceCountByCustomer = async (customerId: string) => {
  try {
    await connectToDatabase();
    const count = await Invoice.countDocuments({ customer: customerId });
    return { success: true, data: count };
  } catch (error) {
    console.error("Failed to fetch invoice count:", error);
    return { success: false, message: "Failed to fetch invoice count." };
  }
};