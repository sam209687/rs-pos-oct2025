// src/actions/packingAlert.actions.ts
"use server";

import { connectToDatabase } from "@/lib/db"; 
import { revalidatePath } from "next/cache";
import PackingMaterial from "@/lib/models/packingMaterial"; 
import { 
    enrichMaterialWithBalance, 
    PackingMaterialWithBalance,
    IPopulatedPackingMaterial // ✅ NEW: Import this type from packingMaterial.actions
} from "./packingMaterial.actions";

// Define the response structure
interface AlertResult {
  success: boolean;
  data?: PackingMaterialWithBalance[];
  message?: string;
}

/**
 * Fetches all packing materials whose current balance is at or below the stock alert quantity.
 */
export async function getLowStockPackingMaterials(): Promise<AlertResult> {
  try {
    await connectToDatabase();

    // 1. Fetch all materials
    const materials = await PackingMaterial.find({})
        .populate('capacityUnit')
        .lean() as unknown as IPopulatedPackingMaterial[]; // ✅ FIX: Cast the lean result to the expected IPopulatedPackingMaterial array

    // 2. Enrich the materials with the calculated 'balance'
    // This uses await Promise.all() because enrichMaterialWithBalance is async
    const enrichedMaterials = await Promise.all(
        materials.map(enrichMaterialWithBalance)
    ) as PackingMaterialWithBalance[];

    // 3. Filter for low stock items: balance <= stockAlertQuantity
    const lowStockMaterials = enrichedMaterials.filter(
      (m) => m.balance <= m.stockAlertQuantity
    );

    // Revalidate the dashboard path to ensure the latest data is shown
    revalidatePath("/admin/dashboard");
    
    return {
      success: true,
      data: lowStockMaterials,
    };
  } catch (error) {
    console.error("Database error fetching low stock packing materials:", error);
    return {
      success: false,
      message: "Failed to fetch low stock materials due to a server error.",
    };
  }
}