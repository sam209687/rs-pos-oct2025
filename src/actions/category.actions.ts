"use server";

import Category from "@/lib/models/category";
import { connectToDatabase } from "@/lib/db";
import { categorySchema } from "@/lib/schemas";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Create a new category
export const createCategory = async (formData: FormData) => {
  try {
    const data = {
      name: formData.get("name"),
      codePrefix: formData.get("codePrefix"),
    };
    
    const validatedData = categorySchema.parse(data);

    await connectToDatabase();
    const newCategory = await Category.create(validatedData);
    revalidatePath("/admin/category");
    revalidatePath("/admin/products");

    return { success: true, data: JSON.parse(JSON.stringify(newCategory)), message: "Category created successfully!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message };
    }
    return { success: false, message: "Failed to create category." };
  }
};

// Update an existing category
export const updateCategory = async (categoryId: string, formData: FormData) => {
  try {
    const data = {
      name: formData.get("name"),
      codePrefix: formData.get("codePrefix"),
    };

    const validatedData = categorySchema.parse(data);

    await connectToDatabase();
    const updatedCategory = await Category.findByIdAndUpdate(categoryId, validatedData, {
      new: true,
    });
    
    if (!updatedCategory) {
      return { success: false, message: "Category not found." };
    }

    revalidatePath("/admin/category");
    revalidatePath("/admin/products");
    
    return { success: true, data: JSON.parse(JSON.stringify(updatedCategory)), message: "Category updated successfully!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message };
    }
    return { success: false, message: "Failed to update category." };
  }
};

export const getCategories = async () => {
  try {
    await connectToDatabase();
    const categories = await Category.find({});
    return { success: true, data: JSON.parse(JSON.stringify(categories)) };
  } catch (error) {
    return { success: false, message: "Failed to fetch categories." };
  }
};

export const getCategoryById = async (categoryId: string) => {
  try {
    await connectToDatabase();
    const category = await Category.findById(categoryId);
    
    if (!category) {
      return { success: false, message: "Category not found." };
    }
    return { success: true, data: JSON.parse(JSON.stringify(category)) };
  } catch (error) {
    return { success: false, message: "Failed to fetch category." };
  }
};