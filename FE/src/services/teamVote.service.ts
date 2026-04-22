import apiClient from './apiClient';

type BackendApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  timestamp?: string;
  statusCode?: number;
};

export type BackendTeamVoteResponse = {
  id: string;
  projectId?: string;
  talentId?: string;
  proposalType?: string;
  proposalId?: string;
  vote?: string;
  votedAt?: string;
};

export const teamVoteService = {
  async listByTalent(talentId: string): Promise<BackendTeamVoteResponse[]> {
    const response = await apiClient.get<BackendApiResponse<BackendTeamVoteResponse[]>>(`/api/teamvotes/talent/${talentId}`);

    if (!response.data?.success) {
      const msg = response.data?.message || response.data?.errors?.[0] || 'Load votes failed';
      throw new Error(msg);
    }

    return response.data?.data || [];
  },
};