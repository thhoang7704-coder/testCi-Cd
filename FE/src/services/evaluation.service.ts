import apiClient from './apiClient';

type BackendApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  timestamp?: string;
  statusCode?: number;
};

export type EvaluatorType = 'COMPANY' | 'MENTOR' | 'TALENT' | 'LAB_ADMIN';
export type EvaluatedType = 'TALENT' | 'MENTOR' | 'PROJECT' | 'COMPANY';

export type BackendEvaluationResponse = {
  id: string;
  projectId: string;
  evaluatorId: string;
  evaluatedId: string;

  evaluatorType: EvaluatorType;
  evaluatedType: EvaluatedType;

  rating?: number | null;
  technicalSkills?: number | null;
  communication?: number | null;
  teamwork?: number | null;
  punctuality?: number | null;

  feedback?: string | null;
  evaluationDate?: string | null;
  isAnonymous?: boolean | null;

  createdAt?: string | null;
  updatedAt?: string | null;
};

export type EvaluationCreateDto = {
  projectId: string;
  evaluatedId: string;
  evaluatedType: EvaluatedType;
  rating?: number;
  technicalSkills?: number;
  communication?: number;
  teamwork?: number;
  punctuality?: number;
  feedback?: string;
  isAnonymous?: boolean;
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

export const evaluationService = {
  async createEvaluation(params: {
    evaluatorId: string;
    evaluatorType: EvaluatorType;
    dto: EvaluationCreateDto;
  }): Promise<BackendEvaluationResponse> {
    const { evaluatorId, evaluatorType, dto } = params;

    try {
      const response = await apiClient.post<BackendApiResponse<BackendEvaluationResponse>>(
        `/api/evaluations/${encodeURIComponent(String(evaluatorId))}`,
        dto,
        { params: { evaluatorType } },
      );

      if (!response.data?.success || !response.data?.data) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Create evaluation failed';
        throw new Error(msg);
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'Create evaluation failed'));
    }
  },

  async getByProject(projectId: string): Promise<BackendEvaluationResponse[]> {
    try {
      const response = await apiClient.get<BackendApiResponse<BackendEvaluationResponse[]>>(
        `/api/evaluations/project/${encodeURIComponent(String(projectId))}`,
      );

      if (!response.data?.success) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to load evaluations';
        throw new Error(msg);
      }

      return response.data?.data || [];
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'Failed to load evaluations'));
    }
  },

  async myEvaluations(evaluatorId: string): Promise<BackendEvaluationResponse[]> {
    try {
      const response = await apiClient.get<BackendApiResponse<BackendEvaluationResponse[]>>(
        `/api/evaluations/my/${encodeURIComponent(String(evaluatorId))}`,
      );

      if (!response.data?.success) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to load my evaluations';
        throw new Error(msg);
      }

      return response.data?.data || [];
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'Failed to load my evaluations'));
    }
  },

  async aboutMe(evaluatedId: string): Promise<BackendEvaluationResponse[]> {
    try {
      const response = await apiClient.get<BackendApiResponse<BackendEvaluationResponse[]>>(
        `/api/evaluations/about/${encodeURIComponent(String(evaluatedId))}`,
      );

      if (!response.data?.success) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to load evaluations about me';
        throw new Error(msg);
      }

      return response.data?.data || [];
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'Failed to load evaluations about me'));
    }
  },

  async projectAverage(projectId: string): Promise<number> {
    try {
      const response = await apiClient.get<BackendApiResponse<number>>(
        `/api/evaluations/project/${encodeURIComponent(String(projectId))}/average`,
      );

      if (!response.data?.success) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to load project average';
        throw new Error(msg);
      }

      return Number(response.data?.data ?? 0);
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'Failed to load project average'));
    }
  },

  async lockProject(projectId: string): Promise<void> {
    try {
      const response = await apiClient.post<BackendApiResponse<string>>(
        `/api/evaluations/project/${encodeURIComponent(String(projectId))}/lock`,
      );

      if (!response.data?.success) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Lock project evaluation failed';
        throw new Error(msg);
      }
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'Lock project evaluation failed'));
    }
  },

  async isProjectLocked(projectId: string): Promise<boolean> {
    try {
      const response = await apiClient.get<BackendApiResponse<boolean>>(
        `/api/evaluations/project/${encodeURIComponent(String(projectId))}/locked`,
      );

      if (!response.data?.success) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to load lock status';
        throw new Error(msg);
      }

      return Boolean(response.data?.data);
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'Failed to load lock status'));
    }
  },

  async finalSummary(projectId: string): Promise<any> {
    try {
      const response = await apiClient.get<BackendApiResponse<any>>(
        `/api/evaluations/project/${encodeURIComponent(String(projectId))}/final-summary`,
      );

      if (!response.data?.success) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to load final summary';
        throw new Error(msg);
      }

      return response.data?.data;
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'Failed to load final summary'));
    }
  },

  async finalExists(projectId: string): Promise<boolean> {
    try {
      const response = await apiClient.get<BackendApiResponse<boolean>>(
        `/api/evaluations/project/${encodeURIComponent(String(projectId))}/final-exists`,
      );

      if (!response.data?.success) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to check final evaluation';
        throw new Error(msg);
      }

      return Boolean(response.data?.data);
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'Failed to check final evaluation'));
    }
  },

  async finalScore(projectId: string): Promise<number> {
    try {
      const response = await apiClient.get<BackendApiResponse<number>>(
        `/api/evaluations/project/${encodeURIComponent(String(projectId))}/final-score`,
      );

      if (!response.data?.success) {
        const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to load final score';
        throw new Error(msg);
      }

      return Number(response.data?.data ?? 0);
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'Failed to load final score'));
    }
  },
};
