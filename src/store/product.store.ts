// src/store/product.store.ts

import { create } from "zustand";
import { IPopulatedProduct } from "@/lib/models/product";
import { ICategory } from "@/lib/models/category";
import { IBrand } from "@/lib/models/brand";
import { ITax } from "@/lib/models/tax";
import { getProducts, getCategories, getBrands, getTaxes } from "@/actions/product.actions";
import { getCurrencySymbol } from "@/actions/currency.actions";
import { toast } from "sonner";

interface ProductStoreState {
  products: IPopulatedProduct[];
  categories: ICategory[];
  brands: IBrand[];
  taxes: ITax[];
  isLoading: boolean;
  currencySymbol: string;
  fetchProducts: () => Promise<void>;
  fetchFormData: () => Promise<void>;
  addProduct: (product: IPopulatedProduct) => void;
  updateProduct: (updatedProduct: IPopulatedProduct) => void;
  removeProduct: (productId: string) => void;
}

export const useProductStore = create<ProductStoreState>((set) => ({
  products: [],
  categories: [],
  brands: [],
  taxes: [],
  isLoading: false,
  currencySymbol: "₹",

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const result = await getProducts();
      if (result.success) {
        set({ products: result.data, isLoading: false });
      } else {
        toast.error(result.message);
        set({ isLoading: false, products: [] });
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      set({ isLoading: false, products: [] });
    }
  },

  fetchFormData: async () => {
    set({ isLoading: true });
    try {
      const [categoriesResult, brandsResult, taxesResult, currencyResult] = await Promise.all([
        getCategories(),
        getBrands(),
        getTaxes(),
        getCurrencySymbol(),
      ]);
      set({
        categories: categoriesResult.success ? categoriesResult.data : [],
        brands: brandsResult.success ? brandsResult.data : [],
        taxes: taxesResult.success ? taxesResult.data : [],
        currencySymbol: currencyResult.success ? currencyResult.data : "₹",
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to fetch form data:", error);
      set({ isLoading: false });
    }
  },

  addProduct: (product) => {
    set((state) => ({ products: [...state.products, product] }));
  },

  updateProduct: (updatedProduct) => {
    set((state) => ({
      products: state.products.map((p) =>
        p._id === updatedProduct._id ? updatedProduct : p
      ),
    }));
  },

  removeProduct: (productId) => {
    set((state) => ({
      products: state.products.filter((p) => p._id !== productId),
    }));
  },
}));