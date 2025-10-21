// src/actions/product.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { generateProductCode } from "@/lib/generate-prod-code";
import { connectToDatabase } from "@/lib/db";
import Product, { IProduct, IPopulatedProduct } from "@/lib/models/product";
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
  tax?: string;
  purchasePrice: number;
  sellingPrice: number;
  totalPrice?: number;
}

export interface BoardPriceItem {
  _id: string;
  productName: string;
  productCode: string;
  sellingPrice: number;
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
    const products = await Product.find({}).populate("category brand tax").lean();
    return { success: true, data: JSON.parse(JSON.stringify(products)) as IPopulatedProduct[] };
  } catch (error) {
    return { success: false, message: "Failed to fetch products." };
  }
};

export const getBoardPriceProducts = async () => {
  try {
    await connectToDatabase();
    // Fetch only the required fields
    const products = await Product.find({})
      .select('productName productCode sellingPrice')
      .lean();

    const totalCount = await Product.countDocuments(); // Count total documents

    const boardPriceData: BoardPriceItem[] = products.map((product) => ({
      // FIX: Assert type of _id to any to resolve TS2339/TS18046 error on .toString()
      _id: (product._id as any).toString(), 
      productName: product.productName,
      productCode: product.productCode,
      sellingPrice: product.sellingPrice,
    }));
    
    return { success: true, data: JSON.parse(JSON.stringify(boardPriceData)), totalCount };
  } catch (error) {
    console.error("Failed to fetch board price products:", error);
    return { success: false, message: "Failed to fetch board price products.", totalCount: 0 };
  }
};

// 💡 Action to update only the selling price
export const updateProductSellingPrice = async (id: string, newPrice: number) => {
  try {
    await connectToDatabase();
    
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { 
        sellingPrice: newPrice,
        totalPrice: newPrice, // Update totalPrice to match sellingPrice
      },
      { new: true, select: 'productName sellingPrice' } // Return only relevant fields
    );

    if (!updatedProduct) {
      return { success: false, message: "Product not found." };
    }
    
    // Revalidate the path to ensure any related caches are cleared
    revalidatePath("/admin/dashboard"); 
    
    return { 
        success: true, 
        message: `${updatedProduct.productName} price updated to ₹${newPrice.toFixed(2)}`,
        data: {
            _id: updatedProduct._id.toString(),
            sellingPrice: updatedProduct.sellingPrice
        }
    };
  } catch (error) {
    console.error("Failed to update product price:", error);
    return { success: false, message: "Failed to update product price." };
  }
};

export const getProductById = async (id: string) => {
  try {
    await connectToDatabase();
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
    
    validatedData.totalPrice = validatedData.sellingPrice;
    
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

    validatedData.totalPrice = validatedData.sellingPrice;
    
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