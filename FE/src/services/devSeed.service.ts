import apiClient from "./apiClient";

type BackendApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  statusCode?: number;
};

export type SeedMentorWorkflowResult = {
  projectId: string;
  projectName: string;
  mentorId: string;
  mentorUserId: string;
  talentId: string;
  talentEmail: string;
  talentPassword: string;
  createdTaskIds: string[];
};

export const devSeedService = {
  async seedMentorWorkflow(): Promise<SeedMentorWorkflowResult> {
    const response = await apiClient.post<
      BackendApiResponse<SeedMentorWorkflowResult>
    >("/api/dev/seed/mentor-workflow");

    if (!response.data?.success || !response.data?.data) {
      throw new Error(
        response.data?.message || response.data?.errors?.[0] || "Seed failed",
      );
    }

    return response.data.data;
  },
};
