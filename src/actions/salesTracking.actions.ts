"use server";

import { connectToDatabase } from "@/lib/db";
import Invoice from "@/lib/models/invoice";

export async function getSalesMetrics(fromDate?: Date, toDate?: Date) {
  try {
    await connectToDatabase();
    
    const matchStage = fromDate && toDate ? {
        createdAt: {
            $gte: new Date(fromDate.toISOString()),
            $lte: new Date(toDate.toISOString()),
        }
    } : {};

    const metrics = await Invoice.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$totalPayable" },
                totalSales: { $sum: 1 },
                avgOrderValue: { $avg: "$totalPayable" },
            },
        },
        {
            $project: {
                _id: 0,
                totalRevenue: 1,
                totalSales: 1,
                avgOrderValue: 1,
            },
        },
    ]);

    return { success: true, data: metrics[0] || {} };
  } catch (error) {
    console.error("Failed to fetch sales metrics:", error);
    return { success: false, message: "Failed to fetch sales metrics." };
  }
}