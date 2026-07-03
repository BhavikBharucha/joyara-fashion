import api from './api';
import type { Coupon, PaginatedResponse } from '../types';

export const couponService = {
  getAll: (page = 1, pageSize = 20) =>
    api.get<PaginatedResponse<Coupon>>('/coupons/', { params: { page, page_size: pageSize } }),

  create: (data: Partial<Coupon>) => api.post<Coupon>('/coupons/', data),

  update: (id: string, data: Partial<Coupon>) => api.put<Coupon>(`/coupons/${id}`, data),

  delete: (id: string) => api.delete(`/coupons/${id}`),

  validate: (code: string, orderAmount: number) =>
    api.post('/coupons/validate', { code, order_amount: orderAmount }),
};
