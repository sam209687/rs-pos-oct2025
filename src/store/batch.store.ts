import { create } from 'zustand';
import { getProductsForBatch, deleteBatch as deleteBatchAction, getBatches } from '@/actions/batch.actions';
import { IBatch } from '@/lib/models/batch';
import { IPopulatedProduct } from '@/lib/models/product';
import { IPopulatedVariant } from '@/lib/models/variant';
import { ICategory } from '@/lib/models/category';
import { getCategories } from '@/actions/product.actions';
import { toast } from 'sonner';

interface IProduct {
  _id: string;
  productName: string;
  productCode: string;
  category: ICategory; 
}

// ✅ FIX: Define a clean, non-extending populated batch interface
export interface IPopulatedBatch {
  _id: string;
  product: IPopulatedProduct;
  batchNumber: string;
  vendorName: string;
  qty: number;
  price: number;
  perUnitPrice?: number;
  oilCakeProduced?: number;
  oilExpelled?: number;
  createdAt: Date;
}

interface BatchStoreState {
  products: IProduct[];
  batches: IPopulatedBatch[];
  categories: ICategory[]; 
  isLoading: boolean;
  isDeleting: boolean; 
  selectedProductCode: string | null;
  fetchProducts: () => Promise<void>;
  fetchBatches: () => Promise<void>; 
  fetchCategories: () => Promise<void>;
  setBatches: (batches: IPopulatedBatch[]) => void;
  updateBatch: (updatedBatch: IPopulatedBatch) => void;
  deleteBatch: (batchId: string) => Promise<void>; 
  setSelectedProductCode: (code: string | null) => void;
}

export const useBatchStore = create<BatchStoreState>((set) => ({
  products: [],
  batches: [],
  categories: [],
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
        set({ batches: result.data as IPopulatedBatch[], isLoading: false });
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

  fetchCategories: async () => {
    try {
      const result = await getCategories();
      if (result.success) {
        set({ categories: result.data });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  },

  setBatches: (batches) => set({ batches }),

  updateBatch: (updatedBatch) => {
    set((state) => ({
      batches: state.batches.map((b) =>
        b._id === updatedBatch._id ? updatedBatch : b
      ),
    }));
  },

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