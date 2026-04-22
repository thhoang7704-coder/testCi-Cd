import apiClient from './apiClient';
import type { Project } from '../types';

type BackendApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  timestamp?: string;
  statusCode?: number;
  
};

export type BackendMentorStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | string;

export type BackendMentorResponse = {
  id: string;
  userId?: string;
  name?: string;                  // THÊM: trường name từ mentors.name
  fullName?: string;              // THÊM: fallback từ users.full_name (nếu backend trả)
  username?: string;
  expertise?: string;
  yearsExperience?: number;
  bio?: string;
  rating?: number | string;
  totalProjects?: number;
  status?: BackendMentorStatus;
  createdAt?: string;
  updatedAt?: string;
  
};

type BackendProjectResponse = {
  id: string;
  companyId?: string;
  mentorId?: string;
  projectName?: string;
  projectCode?: string;
  description?: string;
  requirements?: string;
  budget?: number | string;
  durationMonths?: number;
  startDate?: string;
  endDate?: string;
  actualEndDate?: string;
  status?: string;
  validationStatus?: string;
  validatedById?: string;
  validatedAt?: string;
  rejectionReason?: string;
  maxTeamSize?: number;
  requiredSkills?: string;
  createdAt?: string;
  updatedAt?: string;
};

const parseDateOrUndefined = (v: unknown): Date | undefined => {
  if (!v) return undefined;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? undefined : d;
};

const parseNumberOrZero = (v: unknown): number => {
  if (v === null || v === undefined || v === '') return 0;
  const n = typeof v === 'number' ? v : Number(String(v));
  return Number.isFinite(n) ? n : 0;
};

const splitSkills = (skills: unknown): string[] => {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills.map(String).map((s) => s.trim()).filter(Boolean);
  return String(skills)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

const mapBackendProjectToProject = (p: BackendProjectResponse): Project => {
  const validationStatus = String(p.validationStatus || '').toUpperCase();
  const backendStatus = String(p.status || '').toUpperCase();
  let uiStatus: any = backendStatus;
  if (backendStatus === 'SUBMITTED') uiStatus = 'PENDING';

  const createdAt = parseDateOrUndefined(p.createdAt) || new Date();
  const updatedAt = parseDateOrUndefined(p.updatedAt) || createdAt;

  return {
    id: String(p.id || ''),
    project_name: p.projectName || '',
    description: p.description || '',
    requirements: p.requirements || '',
    budget: parseNumberOrZero(p.budget),
    duration_months: Number(p.durationMonths || 0),
    start_date: parseDateOrUndefined(p.startDate),
    end_date: parseDateOrUndefined(p.endDate),
    max_team_size: Number(p.maxTeamSize || 0),
    required_skills: splitSkills(p.requiredSkills),
    status: uiStatus,
    validation_status: (validationStatus as any) || 'PENDING',
    payment_status: 'NOT_REQUIRED',
    rejection_reason: p.rejectionReason || undefined,
    validated_by: p.validatedById || undefined,
    validated_at: parseDateOrUndefined(p.validatedAt),
    company_id: p.companyId || '',
    mentor_id: p.mentorId || undefined,
    main_mentor_id: undefined,
    created_by: p.companyId || 'company',
    created_at: createdAt,
    updated_at: updatedAt,
  };
};

export const mentorService = {
  async listAllMentors(): Promise<BackendMentorResponse[]> {
    const response = await apiClient.get<BackendApiResponse<BackendMentorResponse[]>>('/api/v1/mentors/');

    if (!response.data?.success) {
      const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to load mentors';
      throw new Error(msg);
    }

    return response.data?.data || [];
  },

  async listMentorsByStatus(status: string): Promise<BackendMentorResponse[]> {
    const response = await apiClient.get<BackendApiResponse<BackendMentorResponse[]>>(`/api/v1/mentors/status/${status}`);

    if (!response.data?.success) {
      const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to load mentors';
      throw new Error(msg);
    }

    return response.data?.data || [];
  },

  async getAssignedProjects(mentorId: string): Promise<Project[]> {
    const response = await apiClient.get<BackendApiResponse<BackendProjectResponse[]>>(`/api/v1/mentors/projects/${mentorId}`);

    if (!response.data?.success) {
      const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to load assigned projects';
      throw new Error(msg);
    }

    return (response.data?.data || []).map(mapBackendProjectToProject);
  },

  async getMyAssignedProjects(): Promise<Project[]> {
    const response = await apiClient.get<BackendApiResponse<BackendProjectResponse[]>>('/api/v1/mentors/projects/me');

    if (!response.data?.success) {
      const msg = response.data?.message || response.data?.errors?.[0] || 'Failed to load assigned projects';
      throw new Error(msg);
    }

    return (response.data?.data || []).map(mapBackendProjectToProject);
  },
};
