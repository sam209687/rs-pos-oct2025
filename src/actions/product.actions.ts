// src/actions/product.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { generateProductCode } from "@/lib/generate-prod-code";
import { connectToDatabase } from "@/lib/db";
import Product, { IProduct } from "@/lib/models/product";
import Category, { ICategory } from "@/lib/models/category";
import Brand, { IBrand } from "@/lib/models/brand";
import Unit, { IUnit } from "@/lib/models/unit";
import Tax, { ITax } from "@/lib/models/tax";
import { getCategoryById } from "./category.actions";
import { productSchema } from "@/lib/schemas";
import { z } from "zod";
import "@/lib/models/brand";
import "@/lib/models/category";
import "@/lib/models/unit";
import "@/lib/models/tax";

export interface ProductData {
  category: string;
  brand: string;
  productCode: string;
  productName: string;
  description?: string;
  // ✅ REMOVED: unit: string;
  tax?: string;
  purchasePrice: number;
  packingCharges?: number;
  laborCharges?: number;
  electricityCharges?: number;
  others1?: number;
  others2?: number;
  totalPrice?: number;
  stockQuantity?: number;
  stockAlertQuantity?: number;
  // ✅ REMOVED: image?: string;
  // ✅ REMOVED: qrCode?: string;
}

export const generateProductCodeForUI = async (categoryId: string) => {
  try {
    const categoryResult = await getCategoryById(categoryId);
    if (!categoryResult.success || !categoryResult.data.codePrefix) {
      return { success: false, message: "Category not found or does not have a code prefix." };
    }
    const newProductCode = await generateProductCode(categoryResult.data.codePrefix);
    return { success: true, data: newProductCode, message: "Product code generated successfully!" };
  } catch (error) {
    console.error("Error generating product code for UI:", error);
    return { success: false, message: "Failed to generate product code." };
  }
};

export const getCategories = async () => {
  try {
    await connectToDatabase();
    const categories = await Category.find({}).lean();
    return { success: true, data: JSON.parse(JSON.stringify(categories)) as ICategory[] };
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return { success: false, message: "Failed to fetch categories." };
  }
};

export const getBrands = async () => {
  try {
    await connectToDatabase();
    const brands = await Brand.find({}).lean();
    return { success: true, data: JSON.parse(JSON.stringify(brands)) as IBrand[] };
  } catch (error) {
    console.error("Failed to fetch brands:", error);
    return { success: false, message: "Failed to fetch brands." };
  }
};

// ✅ REMOVED: getUnits action is no longer needed

export const getTaxes = async () => {
  try {
    await connectToDatabase();
    const taxes = await Tax.find({}).lean();
    return { success: true, data: JSON.parse(JSON.stringify(taxes)) as ITax[] };
  } catch (error) {
    console.error("Failed to fetch taxes:", error);
    return { success: false, message: "Failed to fetch taxes." };
  }
};

export const getProducts = async () => {
  try {
    await connectToDatabase();
    const products = await Product.find({}).lean();
    return { success: true, data: JSON.parse(JSON.stringify(products)) };
  } catch (error) {
    return { success: false, message: "Failed to fetch products." };
  }
};

export const getProductById = async (id: string) => {
  try {
    await connectToDatabase();
    // ✅ UPDATED: Removed 'unit', 'image', 'qrCode' from populate
    const product = await Product.findById(id).populate("category brand tax").lean();
    if (!product) {
      return { success: false, message: "Product not found." };
    }
    return { success: true, data: JSON.parse(JSON.stringify(product)) as IProduct };
  } catch (error) {
    console.error("Error in getProductById:", error);
    return { success: false, message: "Failed to fetch product." };
  }
};

export const createProduct = async (data: ProductData) => {
  try {
    const validatedData = productSchema.parse(data);
    await connectToDatabase();
    const newProduct = new Product(validatedData);
    await newProduct.save();
    revalidatePath("/admin/products");
    return { success: true, data: JSON.parse(JSON.stringify(newProduct)), message: "Product created successfully!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message };
    }
    console.error("Failed to create product:", error);
    return { success: false, message: "Failed to create product." };
  }
};

export const updateProduct = async (id: string, data: ProductData) => {
  try {
    const validatedData = productSchema.parse(data);
    await connectToDatabase();
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      validatedData,
      { new: true }
    );
    if (!updatedProduct) {
      return { success: false, message: "Product not found." };
    }
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    return { success: true, data: JSON.parse(JSON.stringify(updatedProduct)), message: "Product updated successfully!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message };
    }
    console.error("Failed to update product:", error);
    return { success: false, message: "Failed to update product." };
  }
};

export const deleteProduct = async (id: string) => {
  try {
    await connectToDatabase();
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return { success: false, message: "Product not found." };
    }

    revalidatePath("/admin/products");

    return { success: true, message: "Product deleted successfully!" };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { success: false, message: "Failed to delete product." };
  }
};