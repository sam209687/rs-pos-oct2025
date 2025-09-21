import { create } from 'zustand';
import { getCategories, getBrands, getTaxes, getProducts } from '@/actions/product.actions';
import { getCurrencySymbol } from '@/actions/currency.actions'; // ✅ NEW: Import getCurrencySymbol action

import { ICategory } from '@/lib/models/category';
import { IBrand } from '@/lib/models/brand';
import { ITax } from '@/lib/models/tax';
import { IProduct } from '@/lib/models/product';
// ✅ REMOVED: import of IUnit

interface ProductState {
  products: IProduct[];
  selectedProduct: IProduct | null;
  categories: ICategory[];
  brands: IBrand[];
  taxes: ITax[];
  currencySymbol: string; // ✅ NEW: Add currencySymbol state
  isLoading: boolean;
  setProducts: (products: IProduct[]) => void;
  setSelectedProduct: (product: IProduct | null) => void;
  addProduct: (product: IProduct) => void;
  updateProduct: (product: IProduct) => void;
  removeProduct: (productId: string) => void;

  setCategories: (categories: ICategory[]) => void;
  setBrands: (brands: IBrand[]) => void;
  setTaxes: (taxes: ITax[]) => void;
  
  fetchFormData: () => Promise<void>;
  fetchTableData: () => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  selectedProduct: null,
  categories: [],
  brands: [],
  taxes: [],
  currencySymbol: '', // ✅ NEW: Initialize currencySymbol
  isLoading: false,

  setProducts: (products) => set({ products }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
  updateProduct: (updatedProduct) =>
    set((state) => ({
      products: state.products.map((p) =>
        p._id === updatedProduct._id ? updatedProduct : p
      ),
    })),
  removeProduct: (productId) =>
    set((state) => ({
      products: state.products.filter((p) => p._id !== productId),
    })),

  setCategories: (categories) => set({ categories }),
  setBrands: (brands) => set({ brands }),
  setTaxes: (taxes) => set({ taxes }),
  
  fetchFormData: async () => {
    set({ isLoading: true });
    try {
      const [catResult, brandResult, taxResult, currencyResult] = await Promise.all([
        getCategories(),
        getBrands(),
        getTaxes(),
        getCurrencySymbol(), // ✅ NEW: Fetch the currency symbol
      ]);

      if (catResult.success) set({ categories: catResult.data });
      if (brandResult.success) set({ brands: brandResult.data });
      if (taxResult.success) set({ taxes: taxResult.data });
      if (currencyResult.success) set({ currencySymbol: currencyResult.data }); // ✅ NEW: Set the currency symbol
      set({ isLoading: false });
    } catch (error) {
      console.error('Failed to fetch form data:', error);
      set({ isLoading: false });
    }
  },

  fetchTableData: async () => {
    set({ isLoading: true });
    try {
      const result = await getProducts();
      if (result.success) {
        set({ products: result.data, isLoading: false });
      } else {
        set({ isLoading: false, products: [] });
      }
    } catch (error) {
      console.error('Failed to fetch table data:', error);
      set({ isLoading: false, products: [] });
    }
  },
}));