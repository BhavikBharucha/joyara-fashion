import api from './api';
import type { CartItem } from '../types';

export const cartService = {
  getCart: () => api.get<CartItem[]>('/cart/'),

  addToCart: (data: { product_id: string; variant_id?: string; size?: string; color?: string; quantity?: number }) =>
    api.post<CartItem>('/cart/', data),

  updateItem: (itemId: string, quantity: number) =>
    api.put<CartItem>(`/cart/${itemId}`, { quantity }),

  removeItem: (itemId: string) => api.delete(`/cart/${itemId}`),

  clearCart: () => api.delete('/cart/'),
};
