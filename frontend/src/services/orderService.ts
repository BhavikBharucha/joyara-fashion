import api from './api';
import type { Order, PaginatedResponse } from '../types';

export const orderService = {
  create: (data: {
    items: { product_id: string; size?: string; color?: string; quantity: number }[];
    shipping_address_id: string;
    payment_method?: string;
    coupon_code?: string;
    notes?: string;
  }) => api.post<Order>('/orders/', data),

  getMyOrders: (page = 1, pageSize = 20) =>
    api.get<PaginatedResponse<Order>>('/orders/my-orders', { params: { page, page_size: pageSize } }),

  getAll: (page = 1, pageSize = 20, status?: string) =>
    api.get<PaginatedResponse<Order>>('/orders/all', { params: { page, page_size: pageSize, status } }),

  getByNumber: (orderNumber: string) => api.get<Order>(`/orders/${orderNumber}`),

  updateStatus: (orderNumber: string, data: { status: string; tracking_number?: string }) =>
    api.patch<Order>(`/orders/${orderNumber}/status`, data),

  cancel: (orderNumber: string) => api.post<Order>(`/orders/${orderNumber}/cancel`),
};
