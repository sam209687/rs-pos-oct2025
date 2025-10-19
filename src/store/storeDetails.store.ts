// src/store/storeDetailsStore.ts

import { create } from 'zustand';
import { getActiveStore } from '@/actions/store.actions';
import { IStore } from '@/lib/models/store'; // Assuming you have an IStore interface

interface StoreDetailsState {
  activeStore: IStore | null;
  isLoading: boolean;
  fetchActiveStore: () => Promise<void>;
}

export const useStoreDetailsStore = create<StoreDetailsState>((set, get) => ({
  activeStore: null,
  isLoading: true,
  
  fetchActiveStore: async () => {
    // 1. Check for existing data (from first deleted file)
    if (get().activeStore) return;

    set({ isLoading: true });

    try {
      // 2. Execute the server action
      const result = await getActiveStore();

      // 3. Handle successful fetch and data integrity
      // Check if result exists AND result.success is true AND result.data exists
      if (result && result.success && result.data) {
        set({ activeStore: result.data, isLoading: false });
      } else {
        // If result is defined but success is false (or data is missing)
        console.warn("Failed to retrieve active store details:", result);
        set({ activeStore: null, isLoading: false });
      }
    } catch (error) {
      // 4. Catch and handle network/runtime errors (Fixes the TypeError)
      console.error("Failed to fetch active store:", error);
      set({ activeStore: null, isLoading: false });
    }
  },
}));