import apiClient from "./apiClient";

type BackendApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  timestamp?: string;
  statusCode?: number;
};

export type MentorTaskCreateDto = {
  taskName: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  startDate?: string; // yyyy-MM-dd
  dueDate?: string; // yyyy-MM-dd
  estimatedHours?: number | string;
  attachments?: string[];
  assignedTo?: string;
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

export const mentorTaskService = {
  async createTask(projectId: string, dto: MentorTaskCreateDto): Promise<void> {
    try {
      const response = await apiClient.post<BackendApiResponse<any>>(
        `/api/v1/mentors/projects/${projectId}/tasks`,
        dto,
      );

      if (!response.data?.success) {
        const msg =
          response.data?.message ||
          response.data?.errors?.[0] ||
          "Create task failed";
        throw new Error(msg);
      }
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, "Create task failed"));
    }
  },

  async assignTask(taskId: string, talentId: string): Promise<void> {
    try {
      const response = await apiClient.post<BackendApiResponse<any>>(
        `/api/v1/mentors/tasks/${taskId}/assign/${talentId}`,
      );

      if (!response.data?.success) {
        const msg =
          response.data?.message ||
          response.data?.errors?.[0] ||
          "Assign task failed";
        throw new Error(msg);
      }
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, "Assign task failed"));
    }
  },

  async importTasksFromExcelUrl(
    projectId: string,
    excelUrl: string,
  ): Promise<void> {
    try {
      const response = await apiClient.post<BackendApiResponse<any>>(
        `/api/v1/mentors/tasks/breakdown/${projectId}`,
        null,
        { params: { excelTemplate: excelUrl } },
      );

      if (!response.data?.success) {
        const msg =
          response.data?.message ||
          response.data?.errors?.[0] ||
          "Excel import failed";
        throw new Error(msg);
      }
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, "Excel import failed"));
    }
  },

  async importTasksFromExcelFile(projectId: string, file: File): Promise<void> {
    const form = new FormData();
    form.append("file", file);

    try {
      const response = await apiClient.post<BackendApiResponse<any>>(
        `/api/v1/mentors/tasks/breakdown-file/${projectId}`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (!response.data?.success) {
        const msg =
          response.data?.message ||
          response.data?.errors?.[0] ||
          "Excel upload import failed";
        throw new Error(msg);
      }
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, "Excel upload import failed"));
    }
  },
};
