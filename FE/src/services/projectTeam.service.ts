import apiClient from "./apiClient";

type BackendApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  timestamp?: string;
  statusCode?: number;
};

export type BackendProjectTeamResponse = {
  id: string;
  projectId?: string;
  talentId?: string;
  isLeader?: boolean;
  joinedDate?: string;
  leftDate?: string;
  status?: string;
  performanceRating?: number | string;
  createdAt?: string;
  updatedAt?: string;
};

export const projectTeamService = {
  async getByProject(projectId: string): Promise<BackendProjectTeamResponse[]> {
    const response = await apiClient.get<
      BackendApiResponse<BackendProjectTeamResponse[]>
    >(`/api/project-teams/by-project/${projectId}`);

    if (!response.data?.success) {
      const msg =
        response.data?.message ||
        response.data?.errors?.[0] ||
        "Failed to load project team";
      throw new Error(msg);
    }

    return response.data?.data || [];
  },
};
