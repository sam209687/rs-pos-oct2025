"use server";

import { connectToDatabase } from "@/lib/db";
import Invoice from "@/lib/models/invoice";
import Variant from "@/lib/models/variant";

export async function getSalesDataByVariant(fromDate?: Date, toDate?: Date) {
  try {
    await connectToDatabase();

    const matchStage = fromDate && toDate ? {
        createdAt: {
            $gte: new Date(fromDate.toISOString()),
            $lte: new Date(toDate.toISOString()),
        }
    } : {};
    
    const salesData = await Invoice.aggregate([
      { $match: matchStage },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalSales: { $sum: "$items.quantity" }, // ✅ FIX: This now correctly tracks quantity
        },
      },
      {
        $project: {
          _id: 0,
          productName: "$_id",
          totalSales: 1,
        },
      },
    ]);

    return { success: true, data: JSON.parse(JSON.stringify(salesData)) };
  } catch (error) {
    console.error("Failed to fetch sales data by variant:", error);
    return { success: false, message: "Failed to fetch sales data." };
  }
}