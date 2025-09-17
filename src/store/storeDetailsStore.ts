// src/store/storeDetailsStore.ts
import { create } from 'zustand';
import { getActiveStore } from '@/actions/store.actions';
import { IStore } from '@/lib/models/store';

interface StoreDetailsState {
  activeStore: IStore | null;
  fetchActiveStore: () => Promise<void>;
}

export const useStoreDetailsStore = create<StoreDetailsState>((set, get) => ({
  activeStore: null,
  fetchActiveStore: async () => {
    // Prevent re-fetching if data already exists
    if (get().activeStore) return;

    try {
      const result = await getActiveStore();
      if (result.success) {
        set({ activeStore: result.data });
      }
    } catch (error) {
      console.error("Failed to fetch active store:", error);
    }
  },
}));