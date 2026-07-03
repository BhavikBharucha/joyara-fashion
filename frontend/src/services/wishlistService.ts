import api from './api';
import type { WishlistItem } from '../types';

export const wishlistService = {
  getWishlist: () => api.get<WishlistItem[]>('/wishlist/'),

  addToWishlist: (productId: string) =>
    api.post<WishlistItem>('/wishlist/', { product_id: productId }),

  removeFromWishlist: (productId: string) => api.delete(`/wishlist/${productId}`),
};
