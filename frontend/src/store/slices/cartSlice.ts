import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '../../types';

interface CartState {
  items: CartItem[];
  isLoading: boolean;
}

const initialState: CartState = {
  items: [],
  isLoading: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.isLoading = false;
    },
    addCartItem: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.findIndex((i) => i.id === action.payload.id);
      if (existing >= 0) {
        state.items[existing] = action.payload;
      } else {
        state.items.push(action.payload);
      }
    },
    updateCartItem: (state, action: PayloadAction<CartItem>) => {
      const index = state.items.findIndex((i) => i.id === action.payload.id);
      if (index >= 0) state.items[index] = action.payload;
    },
    removeCartItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
    setCartLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCartItems, addCartItem, updateCartItem, removeCartItem, clearCart, setCartLoading } = cartSlice.actions;
export default cartSlice.reducer;
