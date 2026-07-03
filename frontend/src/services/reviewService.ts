import api from './api';
import type { PaginatedResponse, Review } from '../types';

export const reviewService = {
  getProductReviews: (productId: string, page = 1, pageSize = 20) =>
    api.get<PaginatedResponse<Review>>(`/reviews/product/${productId}`, {
      params: { page, page_size: pageSize },
    }),

  create: (data: { product_id: string; rating: number; title?: string; comment?: string }) =>
    api.post<Review>('/reviews/', data),

  update: (id: string, data: Partial<Review>) => api.put<Review>(`/reviews/${id}`, data),

  delete: (id: string) => api.delete(`/reviews/${id}`),
};
