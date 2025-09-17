// src/store/product.store.ts
import { create } from 'zustand';

// Import or define the interfaces for your data types
interface ICategory { _id: string; name: string; codePrefix?: string; }
interface IBrand { _id: string; name: string; }
interface IUnit { _id: string; unitName: string; }
interface ITax { _id: string; taxName: string; }

interface Product {
  _id: string;
  category: string;
  brand: string;
  productCode: string;
  productName: string;
  description?: string;
  unit: string;
  tax: string;
  purchasePrice: number;
  packingCharges: number;
  laborCharges: number;
  electricityCharges: number;
  others1: number;
  others2: number;
  totalPrice: number;
  stockQuantity: number;
  stockAlertQuantity: number;
  image?: string;
  qrCode?: string;
}

// ✅ UPDATED INTERFACE
interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  setProducts: (products: Product[]) => void;
  setSelectedProduct: (product: Product | null) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;

  // ✅ ADDED NEW FIELDS FOR DROPDOWNS
  categories: ICategory[];
  brands: IBrand[];
  units: IUnit[];
  taxes: ITax[];
  setCategories: (categories: ICategory[]) => void;
  setBrands: (brands: IBrand[]) => void;
  setUnits: (units: IUnit[]) => void;
  setTaxes: (taxes: ITax[]) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  selectedProduct: null,
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

  // ✅ INITIALIZE NEW FIELDS
  categories: [],
  brands: [],
  units: [],
  taxes: [],
  setCategories: (categories) => set({ categories }),
  setBrands: (brands) => set({ brands }),
  setUnits: (units) => set({ units }),
  setTaxes: (taxes) => set({ taxes }),
}));