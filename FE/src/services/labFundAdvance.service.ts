import apiClient from './apiClient';

type BackendApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  timestamp?: string;
  statusCode?: number;
};

export type BackendLabFundAdvanceStatus = 'ADVANCED' | 'SETTLED' | 'CANCELLED' | string;

export type BackendLabFundAdvance = {
  id: string;
  advanceAmount?: number | string;
  advanceReason?: string;
  status?: BackendLabFundAdvanceStatus;
  createdAt?: string;
  updatedAt?: string;
  project?: any;
  payment?: any;
  approvedBy?: any;
};

export type CreateLabFundAdvancePayload = {
  projectId: string;
  paymentId?: string;
  advanceAmount: number | string;
  advanceReason: string;
};

const getErrorMessage = (response: BackendApiResponse<any> | undefined, fallback: string) => {
  return response?.message || response?.errors?.[0] || fallback;
};

export const labFundAdvanceService = {
  async create(payload: CreateLabFundAdvancePayload): Promise<BackendLabFundAdvance> {
    const response = await apiClient.post<BackendApiResponse<BackendLabFundAdvance>>(
      '/api/v1/lab-fund-advances/',
      payload,
    );

    if (!response.data?.success) {
      throw new Error(getErrorMessage(response.data, 'Failed to create lab fund advance'));
    }

    if (!response.data?.data) {
      throw new Error('Failed to create lab fund advance: empty response');
    }

    return response.data.data;
  },

  async approve(id: string, approvedByUserId?: string): Promise<BackendLabFundAdvance> {
    const response = await apiClient.put<BackendApiResponse<BackendLabFundAdvance>>(
      `/api/v1/lab-fund-advances/${id}/approve`,
      null,
      { params: approvedByUserId ? { approvedByUserId } : undefined },
    );

    if (!response.data?.success) {
      throw new Error(getErrorMessage(response.data, 'Approve failed'));
    }

    if (!response.data?.data) {
      throw new Error('Approve failed: empty response');
    }

    return response.data.data;
  },

  async settle(id: string, paymentId?: string): Promise<BackendLabFundAdvance> {
    const response = await apiClient.put<BackendApiResponse<BackendLabFundAdvance>>(
      `/api/v1/lab-fund-advances/${id}/settle`,
      null,
      { params: paymentId ? { paymentId } : undefined },
    );

    if (!response.data?.success) {
      throw new Error(getErrorMessage(response.data, 'Settle failed'));
    }

    if (!response.data?.data) {
      throw new Error('Settle failed: empty response');
    }

    return response.data.data;
  },

  async cancel(id: string, reason?: string): Promise<BackendLabFundAdvance> {
    const response = await apiClient.put<BackendApiResponse<BackendLabFundAdvance>>(
      `/api/v1/lab-fund-advances/${id}/cancel`,
      null,
      { params: reason ? { reason } : undefined },
    );

    if (!response.data?.success) {
      throw new Error(getErrorMessage(response.data, 'Cancel failed'));
    }

    if (!response.data?.data) {
      throw new Error('Cancel failed: empty response');
    }

    return response.data.data;
  },

  async getById(id: string): Promise<BackendLabFundAdvance> {
    const response = await apiClient.get<BackendApiResponse<BackendLabFundAdvance>>(
      `/api/v1/lab-fund-advances/${id}`,
    );

    if (!response.data?.success) {
      throw new Error(getErrorMessage(response.data, 'Failed to load lab fund advance'));
    }

    if (!response.data?.data) {
      throw new Error('Failed to load lab fund advance: empty response');
    }

    return response.data.data;
  },

  async listByProject(projectId: string): Promise<BackendLabFundAdvance[]> {
    const response = await apiClient.get<BackendApiResponse<BackendLabFundAdvance[]>>(
      `/api/v1/lab-fund-advances/project/${projectId}`,
    );

    if (!response.data?.success) {
      throw new Error(getErrorMessage(response.data, 'Failed to load advances by project'));
    }

    return response.data?.data || [];
  },

  async listUnsettled(): Promise<BackendLabFundAdvance[]> {
    const response = await apiClient.get<BackendApiResponse<BackendLabFundAdvance[]>>(
      '/api/v1/lab-fund-advances/unsettled',
    );

    if (!response.data?.success) {
      throw new Error(getErrorMessage(response.data, 'Failed to load unsettled advances'));
    }

    return response.data?.data || [];
  },

  async getOutstandingTotal(): Promise<number> {
    const response = await apiClient.get<BackendApiResponse<number | string>>(
      '/api/v1/lab-fund-advances/outstanding-total',
    );

    if (!response.data?.success) {
      throw new Error(getErrorMessage(response.data, 'Failed to load outstanding total'));
    }

    const raw = response.data?.data;
    const n = typeof raw === 'number' ? raw : Number(raw);
    return Number.isFinite(n) ? n : 0;
  },
};
