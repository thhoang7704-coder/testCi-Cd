import apiClient from "./apiClient";

export type CandidateProfilePayload = {
  studentCode: string;
  major?: string;
  year?: number;
  skills?: string;
  certifications?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
};

/**
 * Lấy hồ sơ candidate (talent) của chính mình (ROLE_TALENT)
 */
export const getMyCandidateProfile = () => apiClient.get(`/api/v1/talents/me`);

/**
 * Cập nhật hồ sơ candidate (talent) của chính mình (ROLE_TALENT)
 */
export const updateMyCandidateProfile = (data: CandidateProfilePayload) =>
  apiClient.put(`/api/v1/talents/me`, data);

/**
 * Lấy hồ sơ candidate (talent)
 */
export const getCandidateProfile = (candidateId: string) =>
  apiClient.get(`/api/v1/talents/${candidateId}`);

/**
 * Cập nhật hồ sơ candidate
 */
export const updateCandidateProfile = (
  candidateId: string,
  data: CandidateProfilePayload,
) => apiClient.put(`/api/v1/talents/${candidateId}`, data);

/**
 * Tạo hồ sơ candidate
 */
export const createCandidateProfile = (data: CandidateProfilePayload) =>
  apiClient.post(`/api/v1/talents/`, data);
