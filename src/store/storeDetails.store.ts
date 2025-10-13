import { create } from 'zustand';
import { getActiveStore } from '@/actions/store.actions';
import { IStore } from '@/lib/models/store'; // Assuming you have an IStore interface

interface StoreDetailsState {
  activeStore: IStore | null;
  isLoading: boolean;
  fetchActiveStore: () => Promise<void>;
}

export const useStoreDetailsStore = create<StoreDetailsState>((set) => ({
  activeStore: null,
  isLoading: true,
  fetchActiveStore: async () => {
    set({ isLoading: true });
    try {
      const result = await getActiveStore();
      if (result.success && result.data) {
        set({ activeStore: result.data, isLoading: false });
      } else {
        set({ activeStore: null, isLoading: false });
      }
    } catch (error) {
      console.error("Failed to fetch active store:", error);
      set({ activeStore: null, isLoading: false });
    }
  },
}));