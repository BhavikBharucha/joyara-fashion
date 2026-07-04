import api from './api';
import type { PaginatedResponse, Product, ProductListItem } from '../types';

interface SearchParams {
  q?: string;
  category_id?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  is_trending?: boolean;
  is_featured?: boolean;
  is_new_arrival?: boolean;
  sort_by?: string;
  page?: number;
  page_size?: number;
}

export const productService = {
  search: (params: SearchParams) =>
    api.get<PaginatedResponse<ProductListItem>>('/products/search', { params }),

  getAll: (page = 1, pageSize = 20) =>
    api.get<PaginatedResponse<ProductListItem>>('/products/', { params: { page, page_size: pageSize } }),

  getById: (id: string) => api.get<Product>(`/products/${id}`),

  getBySlug: (slug: string) => api.get<Product>(`/products/slug/${slug}`),

  getFeatured: () => api.get<ProductListItem[]>('/products/featured'),

  getTrending: () => api.get<ProductListItem[]>('/products/trending'),

  getNewArrivals: () => api.get<ProductListItem[]>('/products/new-arrivals'),

  getRelated: (id: string) => api.get<ProductListItem[]>(`/products/${id}/related`),

  create: (data: Partial<Product>) => api.post<Product>('/products/', data),

  update: (id: string, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data),

  delete: (id: string) => api.delete(`/products/${id}`),

  uploadImage: (productId: string, file: File, isPrimary = false, color?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    const params = new URLSearchParams({ is_primary: String(isPrimary) });
    if (color) params.set('color', color);
    return api.post(`/products/${productId}/images?${params.toString()}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteImage: (imageId: string) => api.delete(`/products/images/${imageId}`),
};
