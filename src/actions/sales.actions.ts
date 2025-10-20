"use server";

import { connectToDatabase } from "@/lib/db";
import Invoice from "@/lib/models/invoice";

// ✅ Interface for each variant sales record
export interface VariantSalesData {
  productName: string;
  totalSales: number;
  totalRevenue: number;
  fill: string; // required for chart color
}

// ✅ Interface for response
export interface GetSalesDataByVariantResponse {
  success: boolean;
  data?: VariantSalesData[];
  message?: string;
}

// ✅ Strongly typed & extended function
export async function getSalesDataByVariant(
  fromDate?: Date,
  toDate?: Date
): Promise<GetSalesDataByVariantResponse> {
  try {
    await connectToDatabase();

    // console.log("📦 [getSalesDataByVariant] Connected to DB");

    const matchStage =
      fromDate && toDate
        ? {
            createdAt: {
              $gte: new Date(fromDate.toISOString()),
              $lte: new Date(toDate.toISOString()),
            },
          }
        : {};

    const salesData = await Invoice.aggregate([
      { $match: matchStage },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalSales: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      {
        $project: {
          _id: 0,
          productName: "$_id",
          totalSales: 1,
          totalRevenue: 1,
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // console.log("✅ [getSalesDataByVariant] Results:", salesData);

    return { success: true, data: salesData as VariantSalesData[] };
  } catch (error: any) {
    console.error("❌ [getSalesDataByVariant] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch sales data.",
    };
  }
}
