// src/store/variant.store.ts

import { create } from 'zustand';
import { IUnit } from '@/lib/models/unit';
import { IProduct } from '@/lib/models/product';

interface IVariant {
  _id: string;
  product: string;
  variantVolume: number;
  unit: string;
  variantColor?: string;
  price: number;
  mrp: number;
  image?: string;
}

interface IVariantState {
  variants: IVariant[];
  products: IProduct[];
  units: IUnit[];
  setVariants: (variants: IVariant[]) => void;
  setProducts: (products: IProduct[]) => void;
  setUnits: (units: IUnit[]) => void;
  addVariant: (variant: IVariant) => void;
  updateVariant: (variant: IVariant) => void;
  removeVariant: (variantId: string) => void;
}

export const useVariantStore = create<IVariantState>((set) => ({
  variants: [],
  products: [],
  units: [],
  setVariants: (variants) => set({ variants }),
  setProducts: (products) => set({ products }),
  setUnits: (units) => set({ units }),
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