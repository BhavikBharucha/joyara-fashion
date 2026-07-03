import api from './api';
import type { AuthResponse } from '../types';

export const authService = {
  register: (data: { email: string; password: string; first_name: string; last_name: string; phone?: string }) =>
    api.post<AuthResponse>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),

  refresh: (refresh_token: string) =>
    api.post<AuthResponse>('/auth/refresh', { refresh_token }),

  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post('/auth/change-password', data),
};
