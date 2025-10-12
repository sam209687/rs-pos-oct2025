import { create } from 'zustand';
import { IInvoice } from '@/lib/models/invoice';
import { cancelInvoice } from '@/actions/invoice.actions';
import { toast } from 'sonner';

interface InvoiceStoreState {
  invoices: IInvoice[];
  setInvoices: (invoices: IInvoice[]) => void;
  cancelInvoiceAction: (invoiceId: string) => Promise<void>;
}

export const useInvoiceStore = create<InvoiceStoreState>((set) => ({
  invoices: [],
  setInvoices: (invoices) => set({ invoices }),
  cancelInvoiceAction: async (invoiceId) => {
    const result = await cancelInvoice(invoiceId);
    if (result.success && result.data) {
      toast.success("Invoice has been cancelled.");
      const updatedInvoice = result.data;
      set((state) => ({
        invoices: state.invoices.map((invoice) =>
          invoice._id === invoiceId ? { ...invoice, ...updatedInvoice } : invoice
        ),
      }));
    } else {
      toast.error(result.message);
    }
  },
}));