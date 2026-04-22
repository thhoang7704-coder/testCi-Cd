import apiClient from './apiClient';

export const applicationService = {
  async getApplicationsByTalent(talentId: string) {
    const res = await apiClient.get(`/api/v1/applications/by-talent/${talentId}`);
    return res.data.data || [];
  },
};