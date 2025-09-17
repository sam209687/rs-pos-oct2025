// src/store/category.store.ts
import { create } from 'zustand';

interface Category {
  _id: string;
  name: string;
  codePrefix: string;
}

interface CategoryState {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  setCategories: (categories) => set({ categories }),
}));