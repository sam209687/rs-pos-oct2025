// src/app/api/products/route.ts

import { NextRequest, NextResponse } from "next/server";
// import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product";
import { connectToDatabase } from "@/lib/db";

// GET handler to fetch all products
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const products = await Product.find({});
    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST handler to create a new product
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const product = new Product(body);
    await product.save();
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}