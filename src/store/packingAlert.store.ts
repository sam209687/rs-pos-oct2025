// src/store/packingAlert.store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { 
  getLowStockPackingMaterials 
} from "@/actions/packingAlert.actions";
import { PackingMaterialWithBalance } from "@/actions/packingMaterial.actions"; // Use the type from your actions

// --- State Definition ---

export interface PackingAlertState {
  lowStockMaterials: PackingMaterialWithBalance[];
  isLoading: boolean;
  lastFetched: number | null;
  
  // Actions
  setLowStockMaterials: (materials: PackingMaterialWithBalance[]) => void;
  fetchLowStockMaterials: () => Promise<void>;
}

// --- Store Creation ---

export const usePackingAlertStore = create<PackingAlertState>()(
  devtools(
    (set, get) => ({
      lowStockMaterials: [],
      isLoading: false,
      lastFetched: null,

      setLowStockMaterials: (materials) => {
        set({ 
          lowStockMaterials: materials,
          isLoading: false,
          lastFetched: Date.now() 
        });
      },

      fetchLowStockMaterials: async () => {
        // Prevent fetching if already loading
        if (get().isLoading) return; 

        set({ isLoading: true });
        
        const result = await getLowStockPackingMaterials();

        if (result.success && result.data) {
          set({ 
            lowStockMaterials: result.data, 
            isLoading: false,
            lastFetched: Date.now() 
          });
        } else {
          console.error(result.message || "Failed to fetch low stock materials.");
          set({ isLoading: false });
        }
      },
    }),
    { name: "packing-alert-storage" }
  )
);