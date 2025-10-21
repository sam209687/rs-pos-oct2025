// src/store/stockAlert.store.ts

import { create } from 'zustand';
// 💡 Import the new action and interface
import { getLowStockVariants, LowStockAlertData } from '@/actions/variant.actions'; 

// Use the imported interface for the store data
export interface LowStockVariant extends LowStockAlertData {}

interface StockAlertState {
  lowStockVariants: LowStockVariant[];
  isLoading: boolean;
  error: string | null;
  fetchLowStockAlerts: () => Promise<void>;
}

export const useStockAlertStore = create<StockAlertState>((set) => ({
  lowStockVariants: [],
  isLoading: false,
  error: null,

  fetchLowStockAlerts: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await getLowStockVariants();

      if (result.success && result.data) {
        set({
          lowStockVariants: result.data as LowStockVariant[],
          isLoading: false,
        });
      } else {
        set({ 
          isLoading: false, 
          error: result.message || 'Failed to fetch low stock alerts.',
          lowStockVariants: [],
        });
      }
    } catch (err) {
      console.error("Error fetching low stock alerts:", err);
      set({ isLoading: false, error: 'An unexpected error occurred.' });
    }
  },
}));