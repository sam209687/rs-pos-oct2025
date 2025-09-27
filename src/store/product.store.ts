import { create } from 'zustand';
import { getCategories, getBrands, getTaxes, getProducts, getProductById } from '@/actions/product.actions';
import { getCurrencySymbol } from '@/actions/currency.actions';
import { ICategory } from '@/lib/models/category';
import { IBrand } from '@/lib/models/brand';
import { ITax } from '@/lib/models/tax';
import { IProduct, IPopulatedProduct } from '@/lib/models/product';
import { toast } from 'sonner';

interface ProductState {
  products: IPopulatedProduct[];
  selectedProduct: IProduct | null;
  categories: ICategory[];
  brands: IBrand[];
  taxes: ITax[];
  currencySymbol: string;
  isLoading: boolean;
  setProducts: (products: IPopulatedProduct[]) => void;
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
  currencySymbol: '',
  isLoading: false,

  setProducts: (products) => set({ products }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  
  // ✅ FIX: Refetch the populated product after creation to ensure the correct type
  addProduct: async (product) => {
    const populatedProductResult = await getProductById(product._id);
    if (populatedProductResult.success && populatedProductResult.data) {
      set((state) => ({ products: [...state.products, populatedProductResult.data as unknown as IPopulatedProduct] }));
    }
  },

  // ✅ FIX: Refetch the populated product after update to ensure the correct type
  updateProduct: async (updatedProduct) => {
    const populatedProductResult = await getProductById(updatedProduct._id);
    if (populatedProductResult.success && populatedProductResult.data) {
      set((state) => ({
        products: state.products.map((p) =>
          p._id.toString() === updatedProduct._id.toString() ? populatedProductResult.data as unknown as IPopulatedProduct : p
        ),
      }));
    }
  },

  removeProduct: (productId) =>
    set((state) => ({
      products: state.products.filter((p) => p._id.toString() !== productId),
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
        getCurrencySymbol(),
      ]);

      if (catResult.success) set({ categories: catResult.data });
      if (brandResult.success) set({ brands: brandResult.data });
      if (taxResult.success) set({ taxes: taxResult.data });
      if (currencyResult.success) set({ currencySymbol: currencyResult.data });
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
        set({ products: result.data as IPopulatedProduct[], isLoading: false });
      } else {
        set({ isLoading: false, products: [] });
      }
    } catch (error) {
      console.error('Failed to fetch table data:', error);
      set({ isLoading: false, products: [] });
    }
  },
}));