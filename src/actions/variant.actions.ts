"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import Variant from "@/lib/models/variant";
import { variantSchema } from "@/lib/schemas";
import { z } from "zod";

export interface VariantData {
  product: string;
  variantVolume: number;
  unit: string;
  unitConsumed: number; // ✅ NEW: Added to interface
  unitConsumedUnit: string; // ✅ NEW: Added to interface
  variantColor?: string;
  price: number;
  mrp: number;
  discount?: number;
  stockQuantity: number;
  stockAlertQuantity: number;
  image?: string;
  qrCode?: string;
  packingCharges?: number;
  laborCharges?: number;
  electricityCharges?: number;
  others1?: number;
  others2?: number;
}

// Fetch all variants
export const getVariants = async () => {
  try {
    await connectToDatabase();
    const variants = await Variant.find({}).populate("product unit unitConsumedUnit").lean();
    return { success: true, data: JSON.parse(JSON.stringify(variants)) };
  } catch (error) {
    console.error("Failed to fetch variants:", error);
    return { success: false, message: "Failed to fetch variants." };
  }
};

// Fetch a single variant by ID
export const getVariantById = async (id: string) => {
  try {
    await connectToDatabase();
    const variant = await Variant.findById(id).populate("product unit unitConsumedUnit").lean();
    if (!variant) {
      return { success: false, message: "Variant not found." };
    }
    return { success: true, data: JSON.parse(JSON.stringify(variant)) };
  } catch (error) {
    return { success: false, message: "Failed to fetch variant." };
  }
};

// Create a new variant
export const createVariant = async (data: VariantData) => {
  try {
    const validatedData = variantSchema.parse(data);
    await connectToDatabase();
    const newVariant = new Variant(validatedData);
    await newVariant.save();
    revalidatePath("/admin/variants");
    return { success: true, data: JSON.parse(JSON.stringify(newVariant)), message: "Variant created successfully!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message };
    }
    console.error("Failed to create variant:", error);
    return { success: false, message: "Failed to create variant." };
  }
};

// Update an existing variant
export const updateVariant = async (id: string, data: VariantData) => {
  try {
    const validatedData = variantSchema.parse(data);
    await connectToDatabase();
    const updatedVariant = await Variant.findByIdAndUpdate(
      id,
      validatedData,
      { new: true }
    );
    if (!updatedVariant) {
      return { success: false, message: "Variant not found." };
    }
    revalidatePath("/admin/variants");
    revalidatePath(`/admin/variants/${id}`);
    return { success: true, data: JSON.parse(JSON.stringify(updatedVariant)), message: "Variant updated successfully!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message };
    }
    console.error("Failed to update variant:", error);
    return { success: false, message: "Failed to update variant." };
  }
};

// Delete a variant
export const deleteVariant = async (id: string) => {
  try {
    await connectToDatabase();
    const deletedVariant = await Variant.findByIdAndDelete(id);
    if (!deletedVariant) {
      return { success: false, message: "Variant not found." };
    }
    revalidatePath("/admin/variants");
    return { success: true, message: "Variant deleted successfully!" };
  } catch (error) {
    console.error("Failed to delete variant:", error);
    return { success: false, message: "Failed to delete variant." };
  }
};

// ✅ NEW: Fetch all variants for a given product ID
export const getVariantsByProductId = async (productId: string) => {
  try {
    await connectToDatabase();
    // Fetch variants and populate the unit to get its name
    const variants = await Variant.find({ product: productId }).populate('unit').lean();
    return { success: true, data: JSON.parse(JSON.stringify(variants)) };
  } catch (error) {
    console.error("Failed to fetch variants by product ID:", error);
    return { success: false, message: "Failed to fetch variants." };
  }
};