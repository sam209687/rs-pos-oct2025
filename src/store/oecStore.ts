// src/stores/oecStore.ts
import { create } from 'zustand';
import { getOecs, getProductsForOec } from '@/actions/oec.actions';
import { toast } from 'sonner';

interface IProduct {
  _id: string;
  productName: string;
  productCode: string;
}

export interface IOec {
  _id: string;
  product: IProduct;
  oilExpellingCharges: number;
}

interface OecState {
  oecs: IOec[];
  products: IProduct[];
  isLoading: boolean;
  fetchOecs: () => Promise<void>;
  fetchProducts: () => Promise<void>;
}

export const useOecStore = create<OecState>((set) => ({
  oecs: [],
  products: [],
  isLoading: false,
  fetchOecs: async () => {
    set({ isLoading: true });
    try {
      const result = await getOecs();
      if (result.success) {
        set({ oecs: result.data, isLoading: false });
      } else {
        toast.error(result.message || "Failed to fetch OECs.");
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Failed to fetch OECs:", error);
      toast.error("Failed to fetch OECs due to an unexpected error.");
      set({ isLoading: false });
    }
  },
  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const result = await getProductsForOec();
      if (result.success) {
        set({ products: result.data, isLoading: false });
      } else {
        toast.error(result.message || "Failed to fetch products.");
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to fetch products due to an unexpected error.");
      set({ isLoading: false });
    }
  },
}));