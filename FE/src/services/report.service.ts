import apiClient from './apiClient';

export const resolveBackendBaseUrl = (): string => {
  const base = String((apiClient.defaults as any)?.baseURL || '').trim();
  return base.replace(/\/+$/, '');
};

export const resolveReportAttachmentUrl = (maybeUrl?: string | null): string => {
  const raw = String(maybeUrl || '').trim();
  if (!raw) return '';

  // Already absolute.
  if (/^https?:\/\//i.test(raw)) return raw;

  // If we don't have a configured backend base URL (dev proxy), keep it same-origin.
  const base = resolveBackendBaseUrl();
  if (!base) return raw.startsWith('/') ? raw : `/${raw}`;

  return raw.startsWith('/') ? `${base}${raw}` : `${base}/${raw}`;
};

type BackendApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  timestamp?: string;
  statusCode?: number;
};

export type ReportType = 'MONTHLY' | 'PHASE' | 'FINAL' | 'INCIDENT' | 'WEEKLY' | string;
export type ReportStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'REVISION_NEEDED'
  | string;

export type BackendReportResponse = {
  id: string;
  projectId?: string | null;
  mentorId?: string | null;

  reportType?: ReportType | null;
  title?: string | null;
  content?: string | null;

  reportPeriodStart?: string | null; // YYYY-MM-DD
  reportPeriodEnd?: string | null; // YYYY-MM-DD

  submittedDate?: string | null; // YYYY-MM-DD
  status?: ReportStatus | null;

  reviewedById?: string | null;
  reviewedAt?: string | null; // LocalDateTime
  reviewNotes?: string | null;

  attachmentUrl?: string | null;

  createdAt?: string | null;
  updatedAt?: string | null;
};

export type ReportCreateOrUpdateDto = {
  projectId: string;
  reportType: ReportType;
  title: string;
  content?: string;
  reportPeriodStart?: string; // YYYY-MM-DD
  reportPeriodEnd?: string; // YYYY-MM-DD
  attachmentUrl?: string;
};

const getApiErrorMessage = (error: any, fallback: string): string => {
  const backendData = error?.response?.data;
  const apiMsg = backendData?.message || backendData?.error;
  const apiErrors = backendData?.errors;
  return (
    apiMsg ||
    (Array.isArray(apiErrors) ? apiErrors[0] : null) ||
    error?.message ||
    fallback
  );
};

export const reportService = {
  async createReport(mentorId: string, dto: ReportCreateOrUpdateDto): Promise<BackendReportResponse> {
    try {
      const response = await apiClient.post<BackendApiResponse<BackendReportResponse>>(`/api/reports/${mentorId}`, dto);

      if (!response.data?.success || !response.data?.data) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Create report failed';
        throw new Error(msg);
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'Create report failed'));
    }
  },

  async updateReport(reportId: string, dto: Partial<ReportCreateOrUpdateDto>): Promise<BackendReportResponse> {
    try {
      const response = await apiClient.put<BackendApiResponse<BackendReportResponse>>(`/api/reports/${reportId}`, dto);

      if (!response.data?.success || !response.data?.data) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Update report failed';
        throw new Error(msg);
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'Update report failed'));
    }
  },

  async submitReport(reportId: string): Promise<BackendReportResponse> {
    try {
      const response = await apiClient.put<BackendApiResponse<BackendReportResponse>>(`/api/reports/${reportId}/submit`);

      if (!response.data?.success || !response.data?.data) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Submit report failed';
        throw new Error(msg);
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'Submit report failed'));
    }
  },

  async reviewReport(params: {
    reportId: string;
    adminId: string;
    status: ReportStatus;
    notes?: string;
  }): Promise<BackendReportResponse> {
    const { reportId, adminId, status, notes } = params;

    try {
      const response = await apiClient.put<BackendApiResponse<BackendReportResponse>>(
        `/api/reports/${reportId}/review/${adminId}`,
        null,
        { params: { status, notes } },
      );

      if (!response.data?.success || !response.data?.data) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Review report failed';
        throw new Error(msg);
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'Review report failed'));
    }
  },

  async getAllReports(): Promise<BackendReportResponse[]> {
    try {
      const response = await apiClient.get<BackendApiResponse<BackendReportResponse[]>>('/api/reports/');

      if (!response.data?.success) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to load reports';
        throw new Error(msg);
      }

      return response.data?.data || [];
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'Failed to load reports'));
    }
  },

  async getReportById(reportId: string): Promise<BackendReportResponse> {
    try {
      const response = await apiClient.get<BackendApiResponse<BackendReportResponse>>(`/api/reports/${reportId}`);

      if (!response.data?.success || !response.data?.data) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to load report';
        throw new Error(msg);
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'Failed to load report'));
    }
  },

  async deleteReport(reportId: string): Promise<void> {
    try {
      const response = await apiClient.delete<BackendApiResponse<string>>(`/api/reports/${reportId}`);

      if (!response.data?.success) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Delete report failed';
        throw new Error(msg);
      }
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'Delete report failed'));
    }
  },

  async getMyReports(mentorId: string): Promise<BackendReportResponse[]> {
    try {
      const response = await apiClient.get<BackendApiResponse<BackendReportResponse[]>>(`/api/reports/my/${mentorId}`);

      if (!response.data?.success) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to load my reports';
        throw new Error(msg);
      }

      return response.data?.data || [];
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'Failed to load my reports'));
    }
  },

  async getMyReportsByStatus(mentorId: string, status: ReportStatus): Promise<BackendReportResponse[]> {
    try {
      const response = await apiClient.get<BackendApiResponse<BackendReportResponse[]>>(
        `/api/reports/my/${mentorId}/status/${status}`,
      );

      if (!response.data?.success) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to load my reports';
        throw new Error(msg);
      }

      return response.data?.data || [];
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'Failed to load my reports'));
    }
  },

  async getMyReportsCurrent(): Promise<BackendReportResponse[]> {
    try {
      const response = await apiClient.get<BackendApiResponse<BackendReportResponse[]>>('/api/reports/my');

      if (!response.data?.success) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to load my reports';
        throw new Error(msg);
      }

      return response.data?.data || [];
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'Failed to load my reports'));
    }
  },

  async getMyReportsByStatusCurrent(status: ReportStatus): Promise<BackendReportResponse[]> {
    try {
      const response = await apiClient.get<BackendApiResponse<BackendReportResponse[]>>(`/api/reports/my/status/${status}`);

      if (!response.data?.success) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to load my reports';
        throw new Error(msg);
      }

      return response.data?.data || [];
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'Failed to load my reports'));
    }
  },

  async createMyReport(dto: ReportCreateOrUpdateDto): Promise<BackendReportResponse> {
    try {
      const response = await apiClient.post<BackendApiResponse<BackendReportResponse>>('/api/reports/my', dto);

      if (!response.data?.success || !response.data?.data) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Create report failed';
        throw new Error(msg);
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'Create report failed'));
    }
  },

  async getReportsByMentor(mentorId: string): Promise<BackendReportResponse[]> {
    try {
      const response = await apiClient.get<BackendApiResponse<BackendReportResponse[]>>(`/api/reports/mentor/${mentorId}`);

      if (!response.data?.success) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to load mentor reports';
        throw new Error(msg);
      }

      return response.data?.data || [];
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'Failed to load mentor reports'));
    }
  },

  async getReportsByProject(projectId: string): Promise<BackendReportResponse[]> {
    try {
      const response = await apiClient.get<BackendApiResponse<BackendReportResponse[]>>(`/api/reports/project/${projectId}`);

      if (!response.data?.success) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to load project reports';
        throw new Error(msg);
      }

      return response.data?.data || [];
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'Failed to load project reports'));
    }
  },
};
