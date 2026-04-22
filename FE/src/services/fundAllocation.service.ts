import apiClient from './apiClient';

type BackendApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  timestamp?: string;
  statusCode?: number;
};

export type BackendFundAllocationCreateRequest = {
  paymentId?: string;
  projectId?: string;
  totalAmount: number | string;
  notes?: string;
};

export type BackendFundAllocationResponse = {
  id: string;
  paymentId?: string;
  projectId?: string;
  projectName?: string;
  projectCode?: string;
  totalAmount?: number | string;
  teamAmount?: number | string;
  mentorAmount?: number | string;
  labAmount?: number | string;
  teamPercentage?: number | string;
  mentorPercentage?: number | string;
  labPercentage?: number | string;
  status?: string;
  allocatedById?: string;
  allocatedByName?: string;
  allocatedAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const fundAllocationService = {
  async create(data: BackendFundAllocationCreateRequest): Promise<BackendFundAllocationResponse> {
    const response = await apiClient.post<BackendApiResponse<BackendFundAllocationResponse>>(
      '/api/v1/fund-allocations/',
      {
        ...data,
        totalAmount: typeof data.totalAmount === 'number' ? String(data.totalAmount) : data.totalAmount,
      },
    );

    if (!response.data?.success) {
      const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to create fund allocation';
      throw new Error(msg);
    }

    if (!response.data?.data) {
      throw new Error('Failed to create fund allocation: empty response');
    }

    return response.data.data;
  },

  async getByPaymentId(paymentId: string): Promise<BackendFundAllocationResponse> {
    const response = await apiClient.get<BackendApiResponse<BackendFundAllocationResponse>>(
      `/api/v1/fund-allocations/payment/${paymentId}`,
    );

    if (!response.data?.success) {
      const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to load fund allocation';
      throw new Error(msg);
    }

    if (!response.data?.data) {
      throw new Error('Failed to load fund allocation: empty response');
    }

    return response.data.data;
  },

  async listByProject(projectId: string): Promise<BackendFundAllocationResponse[]> {
    const response = await apiClient.get<BackendApiResponse<BackendFundAllocationResponse[]>>(
      `/api/v1/fund-allocations/project/${projectId}`,
    );

    if (!response.data?.success) {
      const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to load fund allocations';
      throw new Error(msg);
    }

    return response.data?.data || [];
  },
};
