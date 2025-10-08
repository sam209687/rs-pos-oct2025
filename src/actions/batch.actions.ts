// src/actions/batch.actions.ts
"use server";

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/db';
import Product from '@/lib/models/product';
import Batch from '@/lib/models/batch';
import { batchSchema } from '@/lib/schemas';
import { z } from 'zod';
import moment from 'moment';

// ✅ FIX: Update getProductsForBatch to populate the 'category' field
export const getProductsForBatch = async () => {
  try {
    await connectToDatabase();
    // Populate the category field to make its data available on the client
    const products = await Product.find({}).populate('category').sort({ productName: 1 }).lean();
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
      perUnitPrice: Number(formData.get("perUnitPrice")),
      oilCakeProduced: formData.get("oilCakeProduced") ? Number(formData.get("oilCakeProduced")) : undefined,
      oilExpelled: formData.get("oilExpelled") ? Number(formData.get("oilExpelled")) : undefined,
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

// Update an existing batch
export const updateBatch = async (id: string, formData: FormData) => {
  try {
    const data = {
      product: formData.get("product"),
      batchNumber: formData.get("batchNumber"),
      vendorName: formData.get("vendorName"),
      qty: Number(formData.get("qty")),
      price: Number(formData.get("price")),
      perUnitPrice: Number(formData.get("perUnitPrice")),
      oilCakeProduced: formData.get("oilCakeProduced") ? Number(formData.get("oilCakeProduced")) : undefined,
      oilExpelled: formData.get("oilExpelled") ? Number(formData.get("oilExpelled")) : undefined,
    };

    const validatedData = batchSchema.parse(data);
    await connectToDatabase();
    
    const updatedBatch = await Batch.findByIdAndUpdate(id, validatedData, { new: true }).populate({
      path: 'product',
      select: 'productName productCode sellingPrice',
    }).lean();
    
    if (!updatedBatch) {
      return { success: false, message: "Batch not found." };
    }

    revalidatePath("/admin/batch");
    revalidatePath(`/admin/batch/edit/${id}`);
    return { success: true, data: JSON.parse(JSON.stringify(updatedBatch)), message: "Batch updated successfully!" };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message };
    }
    console.error("Failed to update batch:", error);
    return { success: false, message: "Failed to update batch." };
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
  const date = moment().format('DDMMYYYY');
  const timestamp = moment().format('x');
  const batchNumber = `${productCode}-${date}-${timestamp}`;
  return { success: true, data: batchNumber };
};

// Get all batches
export const getBatches = async () => {
    try {
        await connectToDatabase();
        const batches = await Batch.find({}).populate({
            path: 'product',
            select: 'productName productCode sellingPrice', 
        }).lean();
        return { success: true, data: JSON.parse(JSON.stringify(batches)) };
    } catch (error) {
        console.error("Failed to fetch batches:", error);
        return { success: false, message: "Failed to fetch batches." };
    }
};

// Get a single batch by ID
export const getBatchById = async (id: string) => {
  try {
    await connectToDatabase();
    const batch = await Batch.findById(id).populate({
      path: 'product',
      select: 'productName productCode sellingPrice',
    }).lean();
    if (!batch) {
      return { success: false, message: "Batch not found." };
    }
    return { success: true, data: JSON.parse(JSON.stringify(batch)) };
  } catch (error) {
    console.error("Failed to fetch batch by ID:", error);
    return { success: false, message: "Failed to fetch batch." };
  }
};