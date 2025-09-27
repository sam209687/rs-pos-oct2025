// src/store/variantStore.ts

import { create } from 'zustand';
import { IProduct, IPopulatedProduct } from '@/lib/models/product';
import { IUnit } from '@/lib/models/unit';
import { IVariant, IPopulatedVariant } from '@/lib/models/variant';
import { getProductById, getProducts } from '@/actions/product.actions';
import { getUnits } from '@/actions/unit.actions';
import { getVariants, getVariantById } from '@/actions/variant.actions';
import { toast } from 'sonner';

interface IVariantState {
  variants: IPopulatedVariant[];
  products: IPopulatedProduct[];
  units: IUnit[];
  isLoading: boolean;
  productDetails: {
    productCode: string;
    totalPrice: number;
  };
  setVariants: (variants: IPopulatedVariant[]) => void;
  setProducts: (products: IPopulatedProduct[]) => void;
  setUnits: (units: IUnit[]) => void;
  setProductDetails: (details: { productCode: string; totalPrice: number; }) => void;
  fetchVariants: () => Promise<void>;
  fetchFormData: () => Promise<void>;
  fetchProductDetails: (id: string) => Promise<void>;
  addVariant: (variant: IVariant) => Promise<void>;
  updateVariant: (variant: IVariant) => Promise<void>;
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
        set({ variants: result.data as IPopulatedVariant[], isLoading: false });
      } else {
        toast.error(result.message);
        set({ isLoading: false, variants: [] });
      }
    } catch (error) {
      console.error('Failed to fetch variants:', error);
      set({ isLoading: false, variants: [] });
    }
  },

  fetchFormData: async () => {
    set({ isLoading: true });
    try {
      const [productResult, unitResult] = await Promise.all([
        getProducts(),
        getUnits(),
      ]);
      if (productResult.success) set({ products: productResult.data as IPopulatedProduct[] });
      if (unitResult.success) set({ units: unitResult.data });
      set({ isLoading: false });
    } catch (error) {
      console.error('Failed to fetch form data:', error);
      set({ isLoading: false });
    }
  },

  fetchProductDetails: async (id: string) => {
    try {
      const productResult = await getProductById(id);
      if (productResult.success && productResult.data) {
        set({
          productDetails: {
            productCode: productResult.data.productCode || "",
            totalPrice: productResult.data.totalPrice || 0,
          }
        });
      } else {
        set({ productDetails: { productCode: "", totalPrice: 0 } });
      }
    } catch (error) {
      console.error('Failed to fetch product details in store:', error);
      set({ productDetails: { productCode: "", totalPrice: 0 } });
    }
  },

  addVariant: async (variant) => {
    try {
      const populatedVariantResult = await getVariantById(variant._id);
      if (populatedVariantResult.success && populatedVariantResult.data) {
        set((state) => ({ variants: [...state.variants, populatedVariantResult.data as IPopulatedVariant] }));
      }
    } catch (error) {
      console.error("Failed to add variant to store:", error);
    }
  },

  updateVariant: async (updatedVariant) => {
    try {
      const populatedVariantResult = await getVariantById(updatedVariant._id);
      if (populatedVariantResult.success && populatedVariantResult.data) {
        set((state) => ({
          variants: state.variants.map((v) =>
            v._id === updatedVariant._id ? populatedVariantResult.data as IPopulatedVariant : v
          ),
        }));
      }
    } catch (error) {
      console.error("Failed to update variant in store:", error);
    }
  },

  removeVariant: (variantId) =>
    set((state) => ({
      variants: state.variants.filter((v) => v._id !== variantId),
    })),
}));