// src/app/api/batche/[id]/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Batch from "@/lib/models/batch";
import { z } from "zod";
import { batchSchema } from "@/lib/schemas";
import mongoose from "mongoose";

// Handle GET request to fetch a single batch by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const batch = await Batch.findById(params.id).populate({
      path: 'product',
      select: 'productName productCode',
    });

    if (!batch) {
      return NextResponse.json({ success: false, message: "Batch not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: batch, message: "Batch fetched successfully!" });
  } catch (error: unknown) {
    console.error("Failed to fetch batch:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json({ success: false, message: "Failed to fetch batch: " + message }, { status: 500 });
  }
}

// Handle PUT request to update a batch by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const validatedData = batchSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json({ success: false, message: "Invalid form data.", errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
    }

    const updatedBatch = await Batch.findByIdAndUpdate(params.id, validatedData.data, { new: true });
    
    if (!updatedBatch) {
      return NextResponse.json({ success: false, message: "Batch not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedBatch, message: "Batch updated successfully!" }, { status: 200 });
  } catch (error: unknown) {
    console.error("Failed to update batch:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json({ success: false, message: "Failed to update batch: " + message }, { status: 500 });
  }
}

// Handle DELETE request to delete a batch by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    
    const deletedBatch = await Batch.findByIdAndDelete(params.id);
    
    if (!deletedBatch) {
      return NextResponse.json({ success: false, message: "Batch not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Batch deleted successfully!" }, { status: 200 });
  } catch (error: unknown) {
    console.error("Failed to delete batch:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json({ success: false, message: "Failed to delete batch: " + message }, { status: 500 });
  }
}