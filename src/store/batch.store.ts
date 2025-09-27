import { create } from 'zustand';
import { getProductsForBatch, deleteBatch as deleteBatchAction, getBatches } from '@/actions/batch.actions';
import { IBatch } from '@/lib/models/batch';
import { toast } from 'sonner';

interface IProduct {
  _id: string;
  productName: string;
  productCode: string;
}

interface BatchStoreState {
  products: IProduct[];
  batches: IBatch[]; // ✅ FIX: Add batches array to the state
  isLoading: boolean;
  isDeleting: boolean; // Add isDeleting state
  selectedProductCode: string | null;
  fetchProducts: () => Promise<void>;
  fetchBatches: () => Promise<void>; // Add fetchBatches action
  setBatches: (batches: IBatch[]) => void; // ✅ FIX: Add setBatches action
  deleteBatch: (batchId: string) => Promise<void>; // Add deleteBatch action
  setSelectedProductCode: (code: string | null) => void;
}

export const useBatchStore = create<BatchStoreState>((set) => ({
  products: [],
  batches: [], // ✅ FIX: Initialize batches array
  isLoading: false,
  isDeleting: false,
  selectedProductCode: null,
  
  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const result = await getProductsForBatch();
      if (result.success) {
        set({ products: result.data, isLoading: false });
      } else {
        toast.error(result.message);
        set({ isLoading: false, products: [] });
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error("Failed to fetch products due to an unexpected error.");
      set({ isLoading: false, products: [] });
    }
  },

  fetchBatches: async () => {
    set({ isLoading: true });
    try {
      const result = await getBatches();
      if (result.success) {
        set({ batches: result.data, isLoading: false });
      } else {
        toast.error(result.message);
        set({ isLoading: false, batches: [] });
      }
    } catch (error) {
      console.error('Failed to fetch batches:', error);
      toast.error("Failed to fetch batches due to an unexpected error.");
      set({ isLoading: false, batches: [] });
    }
  },

  setBatches: (batches) => set({ batches }), // ✅ FIX: Add setBatches implementation

  deleteBatch: async (batchId) => {
    set({ isDeleting: true });
    try {
      const result = await deleteBatchAction(batchId);
      if (result.success) {
        toast.success(result.message);
        set((state) => ({ batches: state.batches.filter(b => b._id.toString() !== batchId), isDeleting: false }));
      } else {
        toast.error(result.message);
        set({ isDeleting: false });
      }
    } catch (error) {
      console.error('Failed to delete batch:', error);
      toast.error("Failed to delete batch due to an unexpected error.");
      set({ isDeleting: false });
    }
  },

  setSelectedProductCode: (code) => set({ selectedProductCode: code }),
}));