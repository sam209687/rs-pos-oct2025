// src/actions/product.actions.ts

"use server";

import { revalidatePath } from "next/cache";
import { generateProductCode } from "@/lib/generate-prod-code";
import { connectToDatabase } from "@/lib/db";
import Product from "@/lib/models/product";
import { getCategoryById } from "./category.actions";
import { productSchema } from "@/lib/schemas";
import { z } from "zod";

// NEW FUNCTION: Generate a product code for the UI
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

// Fetch all products
export const getProducts = async () => {
  try {
    await connectToDatabase();
    const products = await Product.find({}).lean();
    return { success: true, data: JSON.parse(JSON.stringify(products)) };
  } catch (error) {
    return { success: false, message: "Failed to fetch products." };
  }
};

// Fetch a single product by ID
export const getProductById = async (id: string) => {
  try {
    await connectToDatabase();
    const product = await Product.findById(id).populate("category brand unit tax");
    if (!product) {
      return { success: false, message: "Product not found." };
    }
    return { success: true, data: JSON.parse(JSON.stringify(product)) };
  } catch (error) {
    return { success: false, message: "Failed to fetch product." };
  }
};

// Create a new product
export const createProduct = async (formData: FormData) => {
  try {
    const data = {
      category: formData.get("category"),
      brand: formData.get("brand"),
      productCode: formData.get("productCode"),
      productName: formData.get("productName"),
      description: formData.get("description"),
      unit: formData.get("unit"),
      tax: formData.get("tax") === "" ? undefined : formData.get("tax"),
      purchasePrice: formData.get("purchasePrice"),
      packingCharges: formData.get("packingCharges"),
      laborCharges: formData.get("laborCharges"),
      electricityCharges: formData.get("electricityCharges"),
      others1: formData.get("others1"),
      others2: formData.get("others2"),
      totalPrice: formData.get("totalPrice"),
      stockQuantity: formData.get("stockQuantity"),
      stockAlertQuantity: formData.get("stockAlertQuantity"),
      image: formData.get("image"),
      qrCode: formData.get("qrCode"),
    };

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

// Update an existing product
export const updateProduct = async (id: string, formData: FormData) => {
  try {
    const data = {
      category: formData.get("category"),
      brand: formData.get("brand"),
      productCode: formData.get("productCode"),
      productName: formData.get("productName"),
      description: formData.get("description"),
      unit: formData.get("unit"),
      tax: formData.get("tax") === "" ? undefined : formData.get("tax"),
      purchasePrice: formData.get("purchasePrice"),
      packingCharges: formData.get("packingCharges"),
      laborCharges: formData.get("laborCharges"),
      electricityCharges: formData.get("electricityCharges"),
      others1: formData.get("others1"),
      others2: formData.get("others2"),
      totalPrice: formData.get("totalPrice"),
      stockQuantity: formData.get("stockQuantity"),
      stockAlertQuantity: formData.get("stockAlertQuantity"),
      image: formData.get("image"),
      qrCode: formData.get("qrCode"),
    };

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

// Delete a product
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