import apiClient from './apiClient';

type BackendApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  timestamp?: string;
  statusCode?: number;
};

export type BackendNotificationResponse = {
  id: string;
  title?: string;
  message?: string;
  type?: string;
  isRead?: boolean;
  createdAt?: string;
};

export type BroadcastNotificationRequest = {
  title: string;
  message?: string;
  type?: string;
  sendToAll: boolean;
  roles?: string[];
};

export const notificationService = {
  async listMyNotifications(): Promise<BackendNotificationResponse[]> {
    const response = await apiClient.get<BackendApiResponse<BackendNotificationResponse[]>>('/api/v1/notifications/');
    if (!response.data?.success) {
      const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to load notifications';
      throw new Error(msg);
    }
    return response.data?.data || [];
  },

  async markAsRead(id: string): Promise<BackendNotificationResponse> {
    const response = await apiClient.put<BackendApiResponse<BackendNotificationResponse>>(`/api/v1/notifications/${id}/read`);
    if (!response.data?.success || !response.data?.data) {
      const msg = response.data?.message || response.data?.errors?.[0] || 'Mark read failed';
      throw new Error(msg);
    }
    return response.data.data;
  },

  async markAllAsRead(): Promise<void> {
    const response = await apiClient.put<BackendApiResponse<string>>('/api/v1/notifications/mark-all-read');
    if (response.data && !response.data.success) {
      const msg = response.data?.message || response.data?.errors?.[0] || 'Mark all read failed';
      throw new Error(msg);
    }
  },

  async deleteNotification(id: string): Promise<void> {
    const response = await apiClient.delete<BackendApiResponse<string>>(`/api/v1/notifications/${id}`);
    if (response.data && !response.data.success) {
      const msg = response.data?.message || response.data?.errors?.[0] || 'Delete failed';
      throw new Error(msg);
    }
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<BackendApiResponse<number>>('/api/v1/notifications/unread-count');
    if (!response.data?.success) {
      const msg = response.data?.message || response.data?.errors?.[0] || 'Unread count failed';
      throw new Error(msg);
    }
    return typeof response.data.data === 'number' ? response.data.data : 0;
  },

  async broadcast(request: BroadcastNotificationRequest): Promise<number> {
    const response = await apiClient.post<BackendApiResponse<number>>('/api/v1/notifications/broadcast', request);
    if (!response.data?.success) {
      const msg = response.data?.message || response.data?.errors?.[0] || 'Broadcast failed';
      throw new Error(msg);
    }
    return typeof response.data.data === 'number' ? response.data.data : 0;
  },
};
