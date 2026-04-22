import apiClient from "./apiClient";

type BackendApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  timestamp?: string;
  statusCode?: number;
};

export type BackendTalentStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | string;

export type BackendTalentResponse = {
  id: string;
  userId?: string;
  studentCode?: string;
  major?: string;
  year?: number;
  skills?: string;
  certifications?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  gpa?: number | string;
  status?: BackendTalentStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type BackendTalentTaskResponse = {
  id: string;
  projectId?: string;
  assignedTo?: string;
  createdBy?: string;
  taskName?: string;
  description?: string;
  priority?: string;
  status?: string;
  dueDate?: string;
  completedDate?: string;
  excelTemplateUrl?: string;
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
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

export const talentService = {
  async listAllTalents(): Promise<BackendTalentResponse[]> {
    const response =
      await apiClient.get<BackendApiResponse<BackendTalentResponse[]>>(
        "/api/v1/talents/",
      );

    if (!response.data?.success) {
      const msg =
        response.data?.message ||
        response.data?.errors?.[0] ||
        "Failed to load talents";
      throw new Error(msg);
    }

    return response.data?.data || [];
  },

  async listTalentsByStatus(status: string): Promise<BackendTalentResponse[]> {
    const response = await apiClient.get<
      BackendApiResponse<BackendTalentResponse[]>
    >(`/api/v1/talents/status/${status}`);

    if (!response.data?.success) {
      const msg =
        response.data?.message ||
        response.data?.errors?.[0] ||
        "Failed to load talents";
      throw new Error(msg);
    }

    return response.data?.data || [];
  },

  async getTalentById(id: string): Promise<BackendTalentResponse> {
    try {
      const response = await apiClient.get<
        BackendApiResponse<BackendTalentResponse>
      >(`/api/v1/talents/${id}`);

      if (!response.data?.success || !response.data?.data) {
        const msg =
          response.data?.message ||
          response.data?.errors?.[0] ||
          "Failed to load talent";
        throw new Error(msg);
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, "Failed to load talent"));
    }
  },

  async getMyTasks(): Promise<BackendTalentTaskResponse[]> {
    try {
      const response = await apiClient.get<
        BackendApiResponse<BackendTalentTaskResponse[]>
      >("/api/v1/talents/tasks");

      if (!response.data?.success) {
        const msg =
          response.data?.message ||
          response.data?.errors?.[0] ||
          "Failed to load tasks";
        throw new Error(msg);
      }

      return response.data?.data || [];
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, "Failed to load tasks"));
    }
  },

  async updateTaskProgress(taskId: string, status: string): Promise<void> {
    try {
      const response = await apiClient.put<BackendApiResponse<string>>(
        `/api/v1/talents/tasks/${taskId}/progress`,
        null,
        { params: { status } },
      );

      if (!response.data?.success) {
        const msg =
          response.data?.message ||
          response.data?.errors?.[0] ||
          "Failed to update task progress";
        throw new Error(msg);
      }
    } catch (error: any) {
      throw new Error(
        getApiErrorMessage(error, "Failed to update task progress"),
      );
    }
  },
};
