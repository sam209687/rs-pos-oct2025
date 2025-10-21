import { create } from 'zustand';
import axios from 'axios';

// Define the structure of a single month's sales data
interface MonthlySalesData {
  month: string;          // e.g., "Jan", "Feb" (or the full name)
  totalInvoice: number;   // Total count of invoices for that month
  salesAmount: number;    // Total sales amount for that month
}

// Define the structure of the Zustand store state
interface MonthlySalesState {
  monthlySales: MonthlySalesData[];
  isLoading: boolean;
  error: string | null;
  fetchMonthlySales: () => Promise<void>;
}

// Define the API endpoint (adjust this path to your actual route)
const API_ENDPOINT = '/api/adminPanel/reports/monthly-sales';

export const useMonthlySalesStore = create<MonthlySalesState>((set) => ({
  monthlySales: [],
  isLoading: false,
  error: null,

  fetchMonthlySales: async () => {
    set({ isLoading: true, error: null });
    try {
      // 💡 Assuming you have an API route that runs the Mongoose aggregation 
      //    (as discussed in the previous step) and returns the data.
      const response = await axios.get<{ data: MonthlySalesData[] }>(API_ENDPOINT);
      
      // Axios wraps the response data, and we assume your API returns an object 
      // with a 'data' array, matching the MonthlySalesData structure.
      const fetchedData = response.data.data || [];
      
      set({ monthlySales: fetchedData, isLoading: false });
    } catch (err) {
      console.error("Failed to fetch monthly sales data:", err);
      // Determine error message
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.message || 'Network or server error occurred.'
        : 'An unknown error occurred.';
        
      set({ 
        isLoading: false, 
        error: errorMessage,
        monthlySales: [] // Clear existing data on failure
      });
    }
  },
}));