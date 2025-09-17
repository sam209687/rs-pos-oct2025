// src/lib/store.ts
import { create } from 'zustand';
import { IBrand } from './models/brand';

interface BrandState {
  brands: IBrand[];
  setBrands: (newBrands: IBrand[]) => void;
  addBrand: (brand: IBrand) => void;
  deleteBrand: (slug: string) => void;
  updateBrand: (brand: IBrand) => void;
}

export const useBrandStore = create<BrandState>((set) => ({
  brands: [],
  setBrands: (newBrands) => set({ brands: newBrands }),
  addBrand: (brand) => set((state) => ({ brands: [...state.brands, brand] })),
  deleteBrand: (slug) => set((state) => ({ brands: state.brands.filter((b) => b.slug !== slug) })),
  updateBrand: (updatedBrand) =>
    set((state) => ({
      brands: state.brands.map((brand) =>
        brand.slug === updatedBrand.slug ? updatedBrand : brand
      ),
    })),
}));