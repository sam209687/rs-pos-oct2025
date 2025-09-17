import { create } from 'zustand';
import { IBrand } from '@/lib/models/brand'; // Adjust the import path if needed
import { deleteBrand as deleteBrandAction } from '@/actions/brand.actions'; // Adjust path

interface BrandState {
  brands: IBrand[];
  setBrands: (brands: IBrand[]) => void;
  deleteBrand: (brandId: string, imageUrl: string) => Promise<void>;
}

export const useBrandStore = create<BrandState>((set) => ({
  brands: [],
  setBrands: (brands) => set({ brands }),
  deleteBrand: async (brandId, imageUrl) => {
    // Optimistically remove the brand from the UI
    set((state) => ({
      brands: state.brands.filter((brand) => brand._id !== brandId),
    }));

    try {
      // Call the server action to delete from DB and filesystem
      await deleteBrandAction(brandId, imageUrl);
    } catch (error) {
      // If the server action fails, we would ideally re-add the brand to the state
      // and show an error toast. This part is omitted for brevity.
      console.error("Failed to delete brand:", error);
    }
  },
}));