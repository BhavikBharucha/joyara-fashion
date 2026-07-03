import api from './api';
import type { Category, PaginatedResponse } from '../types';

export const categoryService = {
  getAll: (page = 1, pageSize = 50) =>
    api.get<PaginatedResponse<Category>>('/categories/', { params: { page, page_size: pageSize } }),

  getActive: () => api.get<Category[]>('/categories/active'),

  getFeatured: () => api.get<Category[]>('/categories/featured'),

  getById: (id: string) => api.get<Category>(`/categories/${id}`),

  getBySlug: (slug: string) => api.get<Category>(`/categories/slug/${slug}`),

  create: (data: Partial<Category>) => api.post<Category>('/categories/', data),

  update: (id: string, data: Partial<Category>) => api.put<Category>(`/categories/${id}`, data),

  delete: (id: string) => api.delete(`/categories/${id}`),
};
