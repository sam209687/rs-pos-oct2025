// src/actions/variant.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import Variant from "@/lib/models/variant";
import { variantSchema } from "@/lib/schemas";
import { z } from "zod";

// ✅ CORRECTED: Added 'discount' to the VariantData interface
export interface VariantData {
  product: string;
  variantVolume: number;
  unit: string;
  variantColor?: string;
  price: number;
  mrp: number;
  discount?: number; // ✅ NEW: `discount` field
  image?: string;
  qrCode?: string;
}

// Fetch all variants
export const getVariants = async () => {
  try {
    await connectToDatabase();
    const variants = await Variant.find({}).populate("product unit").lean();
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
    const variant = await Variant.findById(id).populate("product unit").lean();
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
    // Note: The schema should now also be updated to reflect the new discount field.
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