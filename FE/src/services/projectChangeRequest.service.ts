import apiClient from './apiClient';

type BackendApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  timestamp?: string;
  statusCode?: number;
};

export type BackendProjectChangeRequestStatus = string;

export type BackendProjectChangeRequestType =
  | 'SCOPE_CHANGE'
  | 'CANCELLATION'
  | 'TIMELINE_EXTENSION'
  | 'BUDGET_CHANGE'
  | 'TEAM_CHANGE'
  | string;

export type BackendProjectChangeRequestResponse = {
  id: string;
  projectId?: string;
  requestedBy?: string;
  requestType?: BackendProjectChangeRequestType;
  reason?: string;
  proposedChanges?: string;
  impactAnalysis?: string;
  status?: BackendProjectChangeRequestStatus;
  approvedBy?: string;
  requestedDate?: string;
  reviewedDate?: string;
  reviewNotes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type BackendProjectChangeRequestUpsertRequest = {
  projectId: string;
  requestedById: string;
  requestType: BackendProjectChangeRequestType;
  reason?: string;
  proposedChanges?: string;
  impactAnalysis?: string;
};

export type ApplyApprovedChangeRequestPayload = {
  budget?: number;
  durationMonths?: number;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  description?: string;
  requirements?: string;
  requiredSkills?: string;
  maxTeamSize?: number;
};

export const projectChangeRequestService = {
  async listAll(): Promise<BackendProjectChangeRequestResponse[]> {
    const response = await apiClient.get<BackendApiResponse<BackendProjectChangeRequestResponse[]>>(
      '/api/project-change-requests/',
    );

    if (!response.data?.success) {
      const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to load change requests';
      throw new Error(msg);
    }

    return response.data?.data || [];
  },

  async listByProject(projectId: string): Promise<BackendProjectChangeRequestResponse[]> {
    try {
      const response = await apiClient.get<BackendApiResponse<BackendProjectChangeRequestResponse[]>>(
        `/api/project-change-requests/by-project/${projectId}`,
      );

      if (!response.data?.success) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to load change requests';
        throw new Error(msg);
      }

      return response.data?.data || [];
    } catch (err: any) {
      // Backend endpoint occasionally returns 500; fallback to listAll + filter by projectId.
      const status = err?.response?.status;
      if (status && status < 500) throw err;
      const all = await this.listAll();
      return (all || []).filter((x) => String(x.projectId || '') === String(projectId));
    }
  },

  async create(payload: BackendProjectChangeRequestUpsertRequest): Promise<BackendProjectChangeRequestResponse> {
    const response = await apiClient.post<BackendApiResponse<BackendProjectChangeRequestResponse>>(
      '/api/project-change-requests/',
      payload,
    );

    if (!response.data?.success) {
      const msg = response.data?.message || response.data?.errors?.[0] || 'Create change request failed';
      throw new Error(msg);
    }

    if (!response.data?.data) {
      throw new Error('Create change request failed: empty response');
    }

    return response.data.data;
  },

  async update(id: string, payload: BackendProjectChangeRequestUpsertRequest): Promise<BackendProjectChangeRequestResponse> {
    const response = await apiClient.put<BackendApiResponse<BackendProjectChangeRequestResponse>>(
      `/api/project-change-requests/${id}`,
      payload,
    );

    if (!response.data?.success) {
      const msg = response.data?.message || response.data?.errors?.[0] || 'Update change request failed';
      throw new Error(msg);
    }

    if (!response.data?.data) {
      throw new Error('Update change request failed: empty response');
    }

    return response.data.data;
  },

  async cancel(id: string): Promise<BackendProjectChangeRequestResponse> {
    const response = await apiClient.put<BackendApiResponse<BackendProjectChangeRequestResponse>>(
      `/api/project-change-requests/${id}/cancel`,
      null,
    );

    if (!response.data?.success) {
      const msg = response.data?.message || response.data?.errors?.[0] || 'Cancel failed';
      throw new Error(msg);
    }

    if (!response.data?.data) {
      throw new Error('Cancel failed: empty response');
    }

    return response.data.data;
  },

  async remove(id: string): Promise<void> {
    const response = await apiClient.delete<BackendApiResponse<unknown>>(`/api/project-change-requests/${id}`);

    if (response.data && !response.data.success) {
      const msg = response.data?.message || response.data?.errors?.[0] || 'Delete failed';
      throw new Error(msg);
    }
  },

  async approve(id: string, reviewNotes?: string): Promise<BackendProjectChangeRequestResponse> {
    const response = await apiClient.put<BackendApiResponse<BackendProjectChangeRequestResponse>>(
      `/api/project-change-requests/${id}/approve`,
      reviewNotes ? { reviewNotes } : null,
    );

    if (!response.data?.success) {
      const msg = response.data?.message || response.data?.errors?.[0] || 'Approve failed';
      throw new Error(msg);
    }

    if (!response.data?.data) {
      throw new Error('Approve failed: empty response');
    }

    return response.data.data;
  },

  async reject(id: string, reviewNotes: string): Promise<BackendProjectChangeRequestResponse> {
    const response = await apiClient.put<BackendApiResponse<BackendProjectChangeRequestResponse>>(
      `/api/project-change-requests/${id}/reject`,
      { reviewNotes },
    );

    if (!response.data?.success) {
      const msg = response.data?.message || response.data?.errors?.[0] || 'Reject failed';
      throw new Error(msg);
    }

    if (!response.data?.data) {
      throw new Error('Reject failed: empty response');
    }

    return response.data.data;
  },

  async applyApproved(id: string, payload?: ApplyApprovedChangeRequestPayload): Promise<unknown> {
    const response = await apiClient.put<BackendApiResponse<unknown>>(
      `/api/project-change-requests/${id}/apply`,
      payload ?? null,
    );

    if (!response.data?.success) {
      const msg = response.data?.message || response.data?.errors?.[0] || 'Apply failed';
      throw new Error(msg);
    }

    return response.data?.data;
  },
};
