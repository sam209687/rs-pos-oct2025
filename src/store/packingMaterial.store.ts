// src/store/packingMaterial.store.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { toast } from "sonner";
import {
    deletePackingMaterial,
    getPackingMaterials,
    // Import the type for internal use
    PackingMaterialWithBalance, 
} from "@/actions/packingMaterial.actions";

// ✅ FIX 1: Use 'export type' to re-export the type (resolves the ts(2724) error in client components)
export type { PackingMaterialWithBalance } from "@/actions/packingMaterial.actions";

// --- Store State & Actions ---

// ✅ FIX 2: Export the state interface for the Hydrate component
export interface PackingMaterialState {
    materials: PackingMaterialWithBalance[];
    isLoading: boolean;
    setMaterials: (materials: PackingMaterialWithBalance[]) => void;
    fetchMaterials: () => Promise<void>; 
    deleteMaterial: (id: string) => Promise<void>;
}

export const usePackingMaterialStore = create<PackingMaterialState>()(
    devtools(
        persist(
            (set) => ({
                materials: [],
                isLoading: false,

                setMaterials: (materials) => {
                    set({ materials, isLoading: false });
                },

                fetchMaterials: async () => {
                    set({ isLoading: true });
                    const result = await getPackingMaterials();
                    if (result.success && result.data) {
                        set({ materials: result.data });
                    } else {
                        console.error(result.message || "Failed to fetch materials from store.");
                    }
                    set({ isLoading: false });
                },

                deleteMaterial: async (id) => {
                    const result = await deletePackingMaterial(id);
                    if (result.success) {
                        set((state) => ({
                            materials: state.materials.filter((m) => m._id.toString() !== id),
                        }));
                        toast.success("Packing Material deleted.");
                    } else {
                        toast.error(result.message || "Failed to delete packing material.");
                    }
                },
            }),
            {
                name: "packing-material-storage",
                partialize: (state) => ({ materials: state.materials }),
            }
        )
    )
);