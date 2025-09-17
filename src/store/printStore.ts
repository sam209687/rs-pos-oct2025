import { create } from 'zustand';
import { IInvoice } from '@/lib/models/invoice';

interface PrintState {
  isModalOpen: boolean;
  invoiceData: IInvoice | null;
  openModal: (invoice: IInvoice) => void;
  closeModal: () => void;
}

export const usePrintStore = create<PrintState>((set) => ({
  isModalOpen: false,
  invoiceData: null,
  openModal: (invoice) => set({ isModalOpen: true, invoiceData: invoice }),
  closeModal: () => set({ isModalOpen: false, invoiceData: null }),
}));