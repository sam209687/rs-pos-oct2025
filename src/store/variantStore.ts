// src/store/variantStore.ts

import { create } from 'zustand';
import { IProduct } from '@/lib/models/product';
import { IUnit } from '@/lib/models/unit';
import { IVariant } from '@/lib/models/variant';
import { getProductById, getProducts } from '@/actions/product.actions';
import { getUnits } from '@/actions/unit.actions';
import { getVariants } from '@/actions/variant.actions';

interface IVariantState {
  variants: IVariant[];
  products: IProduct[];
  units: IUnit[];
  isLoading: boolean;
  productDetails: {
    productCode: string;
    totalPrice: number;
    stockQuantity: number;
  };
  setVariants: (variants: IVariant[]) => void;
  setProducts: (products: IProduct[]) => void;
  setUnits: (units: IUnit[]) => void;
  setProductDetails: (details: { productCode: string; totalPrice: number; stockQuantity: number }) => void;
  fetchVariants: () => Promise<void>;
  fetchFormData: () => Promise<void>;
  fetchProductDetails: (id: string) => Promise<void>; // ✅ New action
  addVariant: (variant: IVariant) => void;
  updateVariant: (variant: IVariant) => void;
  removeVariant: (variantId: string) => void;
}

export const useVariantStore = create<IVariantState>((set) => ({
  variants: [],
  products: [],
  units: [],
  isLoading: false,
  productDetails: {
    productCode: "",
    totalPrice: 0,
    stockQuantity: 0,
  },
  
  setVariants: (variants) => set({ variants }),
  setProducts: (products) => set({ products }),
  setUnits: (units) => set({ units }),
  setProductDetails: (details) => set({ productDetails: details }),

  fetchVariants: async () => {
    set({ isLoading: true });
    try {
      const result = await getVariants();
      if (result.success) {
        set({ variants: result.data, isLoading: false });
      } else {
        console.error(result.message);
        set({ isLoading: false, variants: [] });
      }
    } catch (error) {
      console.error('Failed to fetch variants:', error);
      set({ isLoading: false, variants: [] });
    }
  },

  fetchFormData: async () => {
    try {
      const [productResult, unitResult] = await Promise.all([
        getProducts(),
        getUnits(),
      ]);
      if (productResult.success) set({ products: productResult.data });
      if (unitResult.success) set({ units: unitResult.data });
    } catch (error) {
      console.error('Failed to fetch form data:', error);
    }
  },

  // ✅ New action to fetch a single product's details
  fetchProductDetails: async (id: string) => {
    try {
      const productResult = await getProductById(id);
      if (productResult.success && productResult.data) {
        set({
          productDetails: {
            productCode: productResult.data.productCode || "",
            totalPrice: productResult.data.totalPrice || 0,
            stockQuantity: productResult.data.stockQuantity || 0,
          }
        });
      } else {
        set({ productDetails: { productCode: "", totalPrice: 0, stockQuantity: 0 } });
      }
    } catch (error) {
      console.error('Failed to fetch product details in store:', error);
      set({ productDetails: { productCode: "", totalPrice: 0, stockQuantity: 0 } });
    }
  },

  addVariant: (variant) => set((state) => ({ variants: [...state.variants, variant] })),
  updateVariant: (updatedVariant) =>
    set((state) => ({
      variants: state.variants.map((v) =>
        v._id === updatedVariant._id ? updatedVariant : v
      ),
    })),
  removeVariant: (variantId) =>
    set((state) => ({
      variants: state.variants.filter((v) => v._id !== variantId),
    })),
}));