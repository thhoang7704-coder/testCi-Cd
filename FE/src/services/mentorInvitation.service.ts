import apiClient from "./apiClient";

type BackendApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  timestamp?: string;
  statusCode?: number;
};

export type MentorInvitationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | string;

export type MentorInvitationRequest = {
  projectId: string;
  mentorId: string;
  invitationMessage?: string;
  proposedFeePercentage?: number;
};

export type BackendMentorInvitationResponse = {
  id: string;
  projectId?: string;
  mentorId?: string;
  invitedBy?: string;
  invitationMessage?: string;
  proposedFeePercentage?: number | string;
  status?: MentorInvitationStatus;
  respondedAt?: string;
  createdAt?: string;
};

export const mentorInvitationService = {
  async createInvitation(
    payload: MentorInvitationRequest,
  ): Promise<BackendMentorInvitationResponse> {
    try {
      const response = await apiClient.post<
        BackendApiResponse<BackendMentorInvitationResponse>
      >("/api/mentor-invitations/", payload);

      if (!response.data?.success || !response.data?.data) {
        const msg =
          response.data?.message ||
          response.data?.errors?.[0] ||
          "Failed to create invitation";
        throw new Error(msg);
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
        "Failed to create invitation";
      throw new Error(msg);
    }
  },

  async listByProject(
    projectId: string,
  ): Promise<BackendMentorInvitationResponse[]> {
    const response = await apiClient.get<
      BackendApiResponse<BackendMentorInvitationResponse[]>
    >(`/api/mentor-invitations/by-project/${projectId}`);

    if (!response.data?.success) {
      const msg =
        response.data?.message ||
        response.data?.errors?.[0] ||
        "Failed to load invitations";
      throw new Error(msg);
    }

    return response.data?.data || [];
  },

  async listByMentor(
    mentorId: string,
  ): Promise<BackendMentorInvitationResponse[]> {
    const response = await apiClient.get<
      BackendApiResponse<BackendMentorInvitationResponse[]>
    >(`/api/mentor-invitations/by-mentor/${mentorId}`);

    if (!response.data?.success) {
      const msg =
        response.data?.message ||
        response.data?.errors?.[0] ||
        "Failed to load invitations";
      throw new Error(msg);
    }

    return response.data?.data || [];
  },

  async listMy(): Promise<BackendMentorInvitationResponse[]> {
    const response = await apiClient.get<
      BackendApiResponse<BackendMentorInvitationResponse[]>
    >(`/api/v1/mentors/invitations/me`);

    if (!response.data?.success) {
      const msg =
        response.data?.message ||
        response.data?.errors?.[0] ||
        "Failed to load my invitations";
      throw new Error(msg);
    }

    return response.data?.data || [];
  },

  async accept(invitationId: string): Promise<BackendMentorInvitationResponse> {
    try {
      const response = await apiClient.put<
        BackendApiResponse<BackendMentorInvitationResponse>
      >(`/api/mentor-invitations/${invitationId}/accept`);

      if (!response.data?.success || !response.data?.data) {
        const msg =
          response.data?.message ||
          response.data?.errors?.[0] ||
          "Accept failed";
        throw new Error(msg);
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
        "Accept failed";
      throw new Error(msg);
    }
  },

  async reject(invitationId: string): Promise<BackendMentorInvitationResponse> {
    try {
      const response = await apiClient.put<
        BackendApiResponse<BackendMentorInvitationResponse>
      >(`/api/mentor-invitations/${invitationId}/reject`);

      if (!response.data?.success || !response.data?.data) {
        const msg =
          response.data?.message ||
          response.data?.errors?.[0] ||
          "Reject failed";
        throw new Error(msg);
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
        "Reject failed";
      throw new Error(msg);
    }
  },
};
