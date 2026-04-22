import apiClient from './apiClient';
import type { Company, CompanyOnboardingRequest } from '../types';

type BackendApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  timestamp?: string;
  statusCode?: number;
};

export type BackendCompanySize =
  | 'ONE_TO_10'
  | 'ELEVEN_TO_50'
  | 'FIFTYONE_TO_200'
  | 'TWOZEROONE_TO_500'
  | 'FIVE_HUNDRED_PLUS';

export type BackendCompanyStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export type BackendCompanyCreateRequest = {
  companyName: string;
  taxCode: string;
  address?: string;
  industry?: string;
  description?: string;
  website?: string;
  companySize?: BackendCompanySize;
};

export type BackendCompanyResponse = {
  id: string;
  userId?: string;
  companyName: string;
  taxCode: string;
  address?: string;
  industry?: string;
  description?: string;
  website?: string;
  companySize?: BackendCompanySize | string;
  status?: BackendCompanyStatus | string;
  approvedById?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
};

const isAxiosNotFoundOrNetwork = (error: any): boolean => {
  const status = error?.response?.status;
  return status === 404 || status === 502 || status === 503 || status === 504 || !error?.response;
};

const now = () => new Date();

const mockCompany: Company = {
  id: 'demo-company-entity',
  company_name: 'TechCorp (Demo)',
  tax_code: 'DEMO-TAX-001',
  address: '123 Demo Street, Ho Chi Minh City',
  industry: 'Technology',
  website: 'https://example.com',
  company_size: 50,
  description: 'Demo company for UI testing.',
  contact_email: 'company@techcorp.com',
  status: 'APPROVED',
  created_by: 'demo-company',
  created_at: now(),
  updated_at: now(),
};

export const companyService = {
  async registerCompanyProfile(data: BackendCompanyCreateRequest): Promise<BackendCompanyResponse> {
    try {
      const response = await apiClient.post<BackendApiResponse<BackendCompanyResponse>>(
        '/api/v1/companies/',
        data,
      );

      if (!response.data?.success) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Company registration failed';
        throw new Error(msg);
      }

      if (!response.data?.data) {
        throw new Error('Company registration failed: empty response');
      }

      return response.data.data;
    } catch (error: any) {
      const backendData = error?.response?.data;
      const apiMsg = backendData?.message || backendData?.error;
      const apiErrors = backendData?.errors;
      const msg =
        apiMsg ||
        (Array.isArray(apiErrors) ? apiErrors[0] : null) ||
        error?.message ||
        'Company registration failed';

      if ((import.meta as any).env?.DEV) {
        // Helpful for debugging 403/500 without leaking full token.
        console.debug('[companyService.registerCompanyProfile] failed', {
          status: error?.response?.status,
          path: backendData?.path,
          message: msg,
        });
      }

      throw new Error(msg);
    }
  },

  async getCompanyByIdFromBackend(id: string): Promise<BackendCompanyResponse> {
    const response = await apiClient.get<BackendApiResponse<BackendCompanyResponse>>(`/api/v1/companies/${id}`);

    if (!response.data?.success) {
      const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to load company';
      throw new Error(msg);
    }

    if (!response.data?.data) {
      throw new Error('Failed to load company: empty response');
    }

    return response.data.data;
  },

  async updateCompanyProfileBackend(id: string, data: BackendCompanyCreateRequest): Promise<BackendCompanyResponse> {
    const response = await apiClient.put<BackendApiResponse<BackendCompanyResponse>>(`/api/v1/companies/${id}`, data);

    if (!response.data?.success) {
      const msg = response.data?.message || response.data?.errors?.[0] || 'Company update failed';
      throw new Error(msg);
    }

    if (!response.data?.data) {
      throw new Error('Company update failed: empty response');
    }

    return response.data.data;
  },

  async deleteCompanyFromBackend(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/companies/${id}`);
  },

  async getCompanies(params?: {
    status?: string;
    industry?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Company[]; total: number }> {
    const response = await apiClient.get('/companies', { params });
    return response.data;
  },

  async getCompany(id: string): Promise<Company> {
    try {
      const response = await apiClient.get(`/companies/${id}`);
      return response.data;
    } catch (error: any) {
      if (isAxiosNotFoundOrNetwork(error)) {
        if (id === mockCompany.id) return mockCompany;
      }
      throw error;
    }
  },

  async createCompanyOnboarding(data: CompanyOnboardingRequest): Promise<Company> {
    const response = await apiClient.post('/companies', data);
    return response.data;
  },

  async updateCompany(id: string, data: Partial<Company>): Promise<Company> {
    const response = await apiClient.patch(`/companies/${id}`, data);
    return response.data;
  },

  async validateCompany(id: string, data: {
    status: 'APPROVED' | 'REJECTED';
    rejection_reason?: string;
    validated_by: string;
  }): Promise<Company> {
    const response = await apiClient.patch(`/companies/${id}/validate`, data);
    return response.data;
  },

  async getMyCompany(): Promise<BackendCompanyResponse> {
    const response = await apiClient.get<BackendApiResponse<BackendCompanyResponse>>('/api/v1/companies/me');

    if (!response.data?.success) {
      const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to load my company';
      throw new Error(msg);
    }

    if (!response.data?.data) {
      throw new Error('Failed to load my company: empty response');
    }

    return response.data.data;
  },

  // ====== Lab Admin: Company approvals (BE: /api/v1/lab-admins + /api/v1/companies) ======
  async listAllCompanies(): Promise<BackendCompanyResponse[]> {
    try {
      const response = await apiClient.get<BackendApiResponse<BackendCompanyResponse[]>>('/api/v1/companies/');

      if (!response.data?.success) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to load companies';
        throw new Error(msg);
      }

      return response.data?.data || [];
    } catch (error: any) {
      const backendData = error?.response?.data;
      const apiMsg = backendData?.message || backendData?.error;
      const apiErrors = backendData?.errors;
      const msg =
        apiMsg ||
        (Array.isArray(apiErrors) ? apiErrors[0] : null) ||
        error?.message ||
        'Failed to load companies';
      throw new Error(msg);
    }
  },

  async listPendingCompanies(): Promise<BackendCompanyResponse[]> {
    try {
      const response = await apiClient.get<BackendApiResponse<BackendCompanyResponse[]>>(
        '/api/v1/lab-admins/pending-companies',
      );

      if (!response.data?.success) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to load pending companies';
        throw new Error(msg);
      }

      return response.data?.data || [];
    } catch (error: any) {
      const backendData = error?.response?.data;
      const apiMsg = backendData?.message || backendData?.error;
      const apiErrors = backendData?.errors;
      const msg =
        apiMsg ||
        (Array.isArray(apiErrors) ? apiErrors[0] : null) ||
        error?.message ||
        'Failed to load pending companies';
      throw new Error(msg);
    }
  },

  async approveCompany(companyId: string, labAdminId: string): Promise<BackendCompanyResponse> {
    try {
      const response = await apiClient.post<BackendApiResponse<BackendCompanyResponse>>(
        `/api/v1/companies/approve/${companyId}`,
        null,
        { params: { labAdminId } },
      );

      if (!response.data?.success) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Approve failed';
        throw new Error(msg);
      }

      if (!response.data?.data) {
        throw new Error('Approve failed: empty response');
      }

      return response.data.data;
    } catch (error: any) {
      const backendData = error?.response?.data;
      const apiMsg = backendData?.message || backendData?.error;
      const apiErrors = backendData?.errors;
      const msg =
        apiMsg ||
        (Array.isArray(apiErrors) ? apiErrors[0] : null) ||
        error?.message ||
        'Approve failed';
      throw new Error(msg);
    }
  },

  async rejectCompany(companyId: string, reason: string, labAdminId: string): Promise<BackendCompanyResponse> {
    try {
      const response = await apiClient.post<BackendApiResponse<BackendCompanyResponse>>(
        `/api/v1/companies/reject/${companyId}`,
        null,
        { params: { reason, labAdminId } },
      );

      if (!response.data?.success) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Reject failed';
        throw new Error(msg);
      }

      if (!response.data?.data) {
        throw new Error('Reject failed: empty response');
      }

      return response.data.data;
    } catch (error: any) {
      const backendData = error?.response?.data;
      const apiMsg = backendData?.message || backendData?.error;
      const apiErrors = backendData?.errors;
      const msg =
        apiMsg ||
        (Array.isArray(apiErrors) ? apiErrors[0] : null) ||
        error?.message ||
        'Reject failed';
      throw new Error(msg);
    }
  },

  async suspendCompany(companyId: string, reason: string): Promise<BackendCompanyResponse> {
    try {
      const response = await apiClient.post<BackendApiResponse<BackendCompanyResponse>>(
        `/api/v1/companies/suspend/${companyId}`,
        null,
        { params: { reason } },
      );

      if (!response.data?.success) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Suspend failed';
        throw new Error(msg);
      }

      if (!response.data?.data) {
        throw new Error('Suspend failed: empty response');
      }

      return response.data.data;
    } catch (error: any) {
      const backendData = error?.response?.data;
      const apiMsg = backendData?.message || backendData?.error;
      const apiErrors = backendData?.errors;
      const msg =
        apiMsg ||
        (Array.isArray(apiErrors) ? apiErrors[0] : null) ||
        error?.message ||
        'Suspend failed';
      throw new Error(msg);
    }
  },
};
