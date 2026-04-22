import apiClient from './apiClient';
import type {
  Setting, ExcelTemplate, EmailTemplate, AuditLog, Notification
} from '../types';

export const systemService = {
  // Settings
  async getSettings(): Promise<Setting[]> {
    const response = await apiClient.get('/settings');
    return response.data;
  },

  async updateSetting(id: string, data: Partial<Setting>): Promise<Setting> {
    const response = await apiClient.patch(`/settings/${id}`, data);
    return response.data;
  },

  // Excel Templates
  async getExcelTemplates(params?: { active?: boolean; type?: string }): Promise<ExcelTemplate[]> {
    const response = await apiClient.get('/excel-templates', { params });
    return response.data;
  },

  async createExcelTemplate(data: Omit<ExcelTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ExcelTemplate> {
    const response = await apiClient.post('/excel-templates', data);
    return response.data;
  },

  async updateExcelTemplate(id: string, data: Partial<ExcelTemplate>): Promise<ExcelTemplate> {
    const response = await apiClient.patch(`/excel-templates/${id}`, data);
    return response.data;
  },

  async deleteExcelTemplate(id: string): Promise<void> {
    await apiClient.delete(`/excel-templates/${id}`);
  },

  // Email Templates
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    const response = await apiClient.get('/email-templates');
    return response.data;
  },

  async updateEmailTemplate(id: string, data: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const response = await apiClient.patch(`/email-templates/${id}`, data);
    return response.data;
  },

  // Audit Logs
  async getAuditLogs(params?: {
    user_id?: string;
    entity_type?: string;
    action?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: AuditLog[]; total: number }> {
    const response = await apiClient.get('/audit-logs', { params });
    return response.data;
  },

  // Users management (for system admin)
  async getUsers(params?: {
    role?: string;
    is_active?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: any[]; total: number }> {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  async updateUser(id: string, data: Partial<any>): Promise<any> {
    const response = await apiClient.patch(`/users/${id}`, data);
    return response.data;
  }
};
