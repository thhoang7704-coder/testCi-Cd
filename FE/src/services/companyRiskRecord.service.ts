import apiClient from './apiClient';

type BackendApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  timestamp?: string;
  statusCode?: number;
};

export type BackendCompanyRiskType = 'PAYMENT' | 'SCOPE' | 'LEGAL' | 'COMMUNICATION' | 'QUALITY' | 'OTHER' | string;
export type BackendRiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;

export type BackendCompanyRiskRecordResponse = {
  id: string;
  companyName?: string;
  companyTaxCode?: string;
  projectName?: string;
  projectCode?: string;
  riskType?: BackendCompanyRiskType;
  severity?: BackendRiskSeverity;
  description?: string;
  recordedByName?: string;
  recordedAt?: string;
};

export type CreateCompanyRiskRecordPayload = {
  companyId: string;
  projectId?: string;
  riskType: BackendCompanyRiskType;
  severity: BackendRiskSeverity;
  description: string;
  recordedById: string;
};

const getErrorMessage = (response: BackendApiResponse<any> | undefined, fallback: string) => {
  return response?.message || response?.errors?.[0] || fallback;
};

export const companyRiskRecordService = {
  async create(payload: CreateCompanyRiskRecordPayload): Promise<BackendCompanyRiskRecordResponse> {
    const response = await apiClient.post<BackendApiResponse<BackendCompanyRiskRecordResponse>>(
      '/api/v1/company-risk-records/',
      payload,
    );

    if (!response.data?.success) {
      throw new Error(getErrorMessage(response.data, 'Failed to create risk record'));
    }

    if (!response.data?.data) {
      throw new Error('Failed to create risk record: empty response');
    }

    return response.data.data;
  },

  async getById(id: string): Promise<BackendCompanyRiskRecordResponse> {
    const response = await apiClient.get<BackendApiResponse<BackendCompanyRiskRecordResponse>>(
      `/api/v1/company-risk-records/${id}`,
    );

    if (!response.data?.success) {
      throw new Error(getErrorMessage(response.data, 'Failed to load risk record'));
    }

    if (!response.data?.data) {
      throw new Error('Failed to load risk record: empty response');
    }

    return response.data.data;
  },

  async listByCompany(companyId: string): Promise<BackendCompanyRiskRecordResponse[]> {
    const response = await apiClient.get<BackendApiResponse<BackendCompanyRiskRecordResponse[]>>(
      `/api/v1/company-risk-records/company/${companyId}`,
    );

    if (!response.data?.success) {
      throw new Error(getErrorMessage(response.data, 'Failed to load risk records by company'));
    }

    return response.data?.data || [];
  },

  async listByProject(projectId: string): Promise<BackendCompanyRiskRecordResponse[]> {
    const response = await apiClient.get<BackendApiResponse<BackendCompanyRiskRecordResponse[]>>(
      `/api/v1/company-risk-records/project/${projectId}`,
    );

    if (!response.data?.success) {
      throw new Error(getErrorMessage(response.data, 'Failed to load risk records by project'));
    }

    return response.data?.data || [];
  },

  async listHighRisk(): Promise<BackendCompanyRiskRecordResponse[]> {
    const response = await apiClient.get<BackendApiResponse<BackendCompanyRiskRecordResponse[]>>(
      '/api/v1/company-risk-records/high-risk',
    );

    if (!response.data?.success) {
      throw new Error(getErrorMessage(response.data, 'Failed to load high risk records'));
    }

    return response.data?.data || [];
  },
};
