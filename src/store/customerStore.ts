// src/store/customerStore.ts

import { create } from 'zustand';
import { toast } from 'sonner';
import { ICustomer } from '@/lib/models/customer';
import { getInvoiceCountByCustomer } from '@/actions/invoice.actions';

interface CustomerState {
  phone: string;
  name: string;
  address: string;
  // ✅ MODIFIED: customer now holds the selected customer (if found)
  customer: ICustomer | null; 
  // ✅ NEW STATE: Holds the list of customers from the partial search
  suggestions: ICustomer[];
  isCustomerFound: boolean;
  isLoading: boolean;
  visitCount: number;
  setPhone: (phone: string) => void;
  setName: (name: string) => void;
  setAddress: (address: string) => void;
  // ✅ MODIFIED ACTION: Renamed for search functionality
  searchCustomersByPhonePrefix: (prefix: string) => Promise<void>; 
  // ✅ NEW ACTION: To select a customer from the suggestion list
  selectCustomer: (selectedCustomer: ICustomer) => Promise<void>; 
  createCustomer: () => Promise<void>;
  resetCustomer: () => void;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  phone: '',
  name: '',
  address: '',
  customer: null,
  suggestions: [], // Initial state
  isCustomerFound: false,
  isLoading: false,
  visitCount: 0,

  setPhone: (phone) => set({ phone }),
  setName: (name) => set({ name }),
  setAddress: (address) => set({ address }),

  // ✅ NEW/MODIFIED ACTION
  searchCustomersByPhonePrefix: async (prefix) => {
    // Only search if prefix length is 3 or more
    if (prefix.length < 3) {
        set({ suggestions: [] });
        return;
    }

    set({ isLoading: true });
    try {
      const url = `${window.location.origin}/api/customer/${prefix}`;
      const response = await fetch(url);

      if (response.ok) {
        // API now returns an array of customers
        const foundCustomers: ICustomer[] = await response.json();
        set({
          suggestions: foundCustomers,
          isLoading: false,
        });
      } else {
        // If 404 (no match), clear suggestions
        set({ suggestions: [], isLoading: false });
      }
    } catch (error) {
      console.error("Error searching customers:", error);
      set({ isLoading: false });
    }
  },

  // ✅ NEW ACTION: Sets the selected customer and fetches their visit count
  selectCustomer: async (selectedCustomer) => {
    // This is run when the user clicks a suggestion
    const countResult = await getInvoiceCountByCustomer(selectedCustomer._id);

    set({
      phone: selectedCustomer.phone,
      name: selectedCustomer.name,
      address: selectedCustomer.address || '',
      customer: selectedCustomer,
      isCustomerFound: true,
      suggestions: [], // Clear suggestions after selection
      visitCount: countResult.success ? countResult.data : 0,
    });
    toast.success(`Customer selected: ${selectedCustomer.name}`);
  },

  createCustomer: async () => {
    // ... (logic remains the same)
  },

  resetCustomer: () => set({ 
    phone: '', 
    name: '', 
    address: '', 
    customer: null, 
    isCustomerFound: false, 
    suggestions: [], // Reset suggestions
    visitCount:0 
  }),
}));