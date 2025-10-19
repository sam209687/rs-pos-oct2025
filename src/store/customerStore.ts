import { create } from 'zustand';
import { toast } from 'sonner';
import { ICustomer } from '@/lib/models/customer';
import { getInvoiceCountByCustomer } from '@/actions/invoice.actions';

interface CustomerState {
// ... (Interface remains the same)
  phone: string;
  name: string;
  address: string;
  customer: ICustomer | null;
  isCustomerFound: boolean;
  isLoading: boolean;
  visitCount: number;
  setPhone: (phone: string) => void;
  setName: (name: string) => void;
  setAddress: (address: string) => void;
  findCustomerByPhone: (phone: string) => Promise<void>;
  createCustomer: () => Promise<void>;
  resetCustomer: () => void;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
// ... (State initialization remains the same)
  phone: '',
  name: '',
  address: '',
  customer: null,
  isCustomerFound: false,
  isLoading: false,
  visitCount: 0,

  setPhone: (phone) => set({ phone }),
  setName: (name) => set({ name }),
  setAddress: (address) => set({ address }),

  findCustomerByPhone: async (phone) => {
    if (phone.length !== 10) return;
    set({ isLoading: true, visitCount:0 });
    try {
      // ✅ FIX: Use window.location.origin to create the absolute URL for robustness
      const url = `${window.location.origin}/api/customer/${phone}`;
      const response = await fetch(url);

      if (response.ok) {
        const foundCustomer: ICustomer = await response.json();
        
        const countResult = await getInvoiceCountByCustomer(foundCustomer._id);
        
        set({
          name: foundCustomer.name,
          address: foundCustomer.address || '',
          customer: foundCustomer,
          isCustomerFound: true,
          isLoading: false,
           visitCount: countResult.success ? countResult.data : 0,
        });
        toast.success(`Customer found: ${foundCustomer.name}`);
      } else {
        // Log the actual status/text if the fetch was successful but the API returned an error status (4xx or 5xx)
        const errorText = await response.text();
        console.error(`API Error finding customer: ${response.status} - ${errorText}`);
        set({ name: '', address: '', customer: null, isCustomerFound: false, isLoading: false, visitCount:0 });
      }
    } catch (error) {
      // This catch block handles the 'TypeError: Failed to fetch' (network/CORS/DNS issue)
      console.error("Error finding customer (Network/Fetch Failure):", error);
      toast.error("Network error. Could not connect to API.");
      set({ isLoading: false });
    }
  },

  createCustomer: async () => {
    const { phone, name, address } = get();
    if (phone.length !== 10 || name.trim().length < 2) {
      toast.error("Please enter a valid 10-digit phone and a name.");
      return;
    }
    set({ isLoading: true });
    try {
      // It's good practice to use absolute URLs here too
      const url = `${window.location.origin}/api/customer`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name, address }),
      });
      const newCustomer = await response.json();
      if (response.ok) {
        set({ isCustomerFound: true, customer: newCustomer, isLoading: false });
        toast.success(`New customer "${newCustomer.name}" added successfully!`);
      } else {
        toast.error(newCustomer.message || "Failed to add customer.");
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      toast.error("An unexpected error occurred.");
      set({ isLoading: false });
    }
  },

  resetCustomer: () => set({ phone: '', name: '', address: '', customer: null, isCustomerFound: false, visitCount:0 }),
}));