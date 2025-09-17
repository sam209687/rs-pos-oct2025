import { create } from 'zustand';
import { getVariantsForPOS, IPosVariant } from '@/actions/pos/pos.actions';
import { v4 as uuidv4 } from 'uuid';

export interface ICartItem {
  _id: string;
  quantity: number;
  price: number;
  product: {
    productName: string;
    productCode?: string;
    tax?: {
        gst: number;
        hsn: string; // ✅ FIX: Add the missing 'hsn' property here
    }
  };
  mrp?: number;
  discountPercentage?: number;
  variantVolume?: number;
  unit?: { _id: string; name: string };
  variantColor?: string;
  type: 'variant' | 'oec';
}

export interface OecCartItem {
    productName: string;
    quantity: number;
    price: number;
}

interface PosState {
  products: IPosVariant[];
  cart: ICartItem[];
  searchQuery: string;
  isLoading: boolean;
  isGstEnabled: boolean;
  setSearchQuery: (query: string) => void;
  fetchProducts: () => Promise<void>;
  addToCart: (product: IPosVariant) => void;
  addOecToCart: (item: OecCartItem) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleGst: () => void;
}

export const usePosStore = create<PosState>((set, get) => ({
  products: [],
  cart: [],
  searchQuery: '',
  isLoading: false,
  isGstEnabled: false,
  setSearchQuery: (query) => set({ searchQuery: query }),

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const { success, data, message } = await getVariantsForPOS();
      if (success) {
        set({ products: data, isLoading: false });
      } else {
        console.error(message);
        set({ isLoading: false, products: [] });
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      set({ isLoading: false, products: [] });
    }
  },

  addToCart: (product) => {
    const existingItem = get().cart.find(item => item._id === product._id);
    if (existingItem) {
      get().updateCartQuantity(product._id, existingItem.quantity + 1);
    } else {
      set(state => ({
        cart: [...state.cart, { ...product, quantity: 1, type: 'variant' }]
      }));
    }
  },
  
  addOecToCart: (item) => {
    const newOecItem: ICartItem = {
        _id: uuidv4(),
        product: {
            productName: item.productName,
        },
        price: item.price,
        quantity: item.quantity,
        type: 'oec',
    };
    set(state => ({
        cart: [...state.cart, newOecItem]
    }));
  },

  updateCartQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
    } else {
      set(state => ({
        cart: state.cart.map(item =>
          item._id === productId ? { ...item, quantity } : item
        )
      }));
    }
  },
  removeFromCart: (productId) => {
    set(state => ({
      cart: state.cart.filter(item => item._id !== productId)
    }));
  },

  clearCart: () => set({ cart: [], isGstEnabled: false }),
  
  toggleGst: () => set(state => ({ isGstEnabled: !state.isGstEnabled })),
}));