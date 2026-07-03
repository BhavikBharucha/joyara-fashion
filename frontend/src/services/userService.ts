import api from './api';
import type { Address, PaginatedResponse, User } from '../types';

export const userService = {
  getProfile: () => api.get<User>('/users/me'),

  updateProfile: (data: Partial<User>) => api.put<User>('/users/me', data),

  getCustomers: (page = 1, pageSize = 20) =>
    api.get<PaginatedResponse<User>>('/users/customers', { params: { page, page_size: pageSize } }),

  toggleUserStatus: (userId: string) => api.patch<User>(`/users/${userId}/toggle-status`),

  getAddresses: () => api.get<Address[]>('/addresses/'),

  createAddress: (data: Partial<Address>) => api.post<Address>('/addresses/', data),

  updateAddress: (id: string, data: Partial<Address>) => api.put<Address>(`/addresses/${id}`, data),

  deleteAddress: (id: string) => api.delete(`/addresses/${id}`),
};
