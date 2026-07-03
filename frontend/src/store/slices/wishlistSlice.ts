import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { WishlistItem } from '../../types';

interface WishlistState {
  items: WishlistItem[];
}

const initialState: WishlistState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlistItems: (state, action: PayloadAction<WishlistItem[]>) => {
      state.items = action.payload;
    },
    addWishlistItem: (state, action: PayloadAction<WishlistItem>) => {
      state.items.push(action.payload);
    },
    removeWishlistItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.product_id !== action.payload);
    },
  },
});

export const { setWishlistItems, addWishlistItem, removeWishlistItem } = wishlistSlice.actions;
export default wishlistSlice.reducer;
