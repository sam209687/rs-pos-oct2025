// src/actions/batch.actions.ts
"use server";

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/db';
import Product from '@/lib/models/product';
import Batch from '@/lib/models/batch';
import { batchSchema } from '@/lib/schemas';
import { z } from 'zod';
import moment from 'moment';

// Helper function to get product data for the dropdown
export const getProductsForBatch = async () => {
  try {
    await connectToDatabase();
    const products = await Product.find({}, 'productName productCode').sort({ productName: 1 });
    return { success: true, data: JSON.parse(JSON.stringify(products)) };
  } catch (error) {
    console.error("Failed to fetch products for batch:", error);
    return { success: false, message: "Failed to fetch products." };
  }
};

// Create a new batch
export const createBatch = async (formData: FormData) => {
  try {
    const data = {
      product: formData.get("product"),
      batchNumber: formData.get("batchNumber"),
      vendorName: formData.get("vendorName"),
      qty: Number(formData.get("qty")),
      price: Number(formData.get("price")),
    };
    
    const validatedData = batchSchema.parse(data);

    await connectToDatabase();
    const newBatch = await Batch.create(validatedData);

    revalidatePath("/admin/batch");

    return { success: true, data: JSON.parse(JSON.stringify(newBatch)), message: "Batch created successfully!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message };
    }
    console.error("Failed to create batch:", error);
    return { success: false, message: "Failed to create batch." };
  }
};

// Delete a batch
export const deleteBatch = async (batchId: string) => {
    try {
        await connectToDatabase();
        const deletedBatch = await Batch.findByIdAndDelete(batchId);
        if (!deletedBatch) {
            return { success: false, message: "Batch not found." };
        }
        revalidatePath("/admin/batches");
        return { success: true, message: "Batch deleted successfully!" };
    } catch (error) {
        console.error("Failed to delete batch:", error);
        return { success: false, message: "Failed to delete batch." };
    }
};

// Generate batch number logic
export const generateBatchNumber = async (productCode: string) => {
  const date = moment().format('DD-MM-YYYY');
  const batchNumber = `${productCode}-${date}`;
  return { success: true, data: batchNumber };
};

// Get all batches
export const getBatches = async () => {
    try {
        await connectToDatabase();
        const batches = await Batch.find({}).populate({
            path: 'product',
            select: 'productName productCode',
        });
        return { success: true, data: JSON.parse(JSON.stringify(batches)) };
    } catch (error) {
        console.error("Failed to fetch batches:", error);
        return { success: false, message: "Failed to fetch batches." };
    }
};