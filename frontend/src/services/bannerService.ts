import api from './api';
import type { Banner } from '../types';

export const bannerService = {
  getActive: (position = 'hero') =>
    api.get<Banner[]>('/banners/active', { params: { position } }),

  getAll: () => api.get('/banners/'),

  create: (formData: FormData) =>
    api.post<Banner>('/banners/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: string, data: Partial<Banner>) => api.put<Banner>(`/banners/${id}`, data),

  delete: (id: string) => api.delete(`/banners/${id}`),
};
