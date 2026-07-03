import api from './api';

export const notificationService = {
  getNotifications: (page = 1, pageSize = 20) =>
    api.get('/notifications/', { params: { page, page_size: pageSize } }),

  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),

  markAllRead: () => api.patch('/notifications/read-all'),
};
