// Project Types
export type ProjectStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
export type ProjectValidationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ProjectPaymentStatus = 'NOT_REQUIRED' | 'PENDING' | 'PAID' | 'FAILED';

export interface Project {
  id: string;
  project_name: string;
  project_code?: string;
  description: string;
  requirements: string;
  budget: number;
  duration_months: number;
  start_date?: Date;
  end_date?: Date;
  max_team_size: number;
  required_skills: string[];
  status: ProjectStatus;
  validation_status: ProjectValidationStatus;
  payment_status?: ProjectPaymentStatus;
  rejection_reason?: string;
  validated_by?: string;
  validated_at?: Date;
  company_id: string;
  mentor_id?: string;
  main_mentor_id?: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectApplication {
  id: string;
  project_id: string;
  talent_id: string;
  cover_letter: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
  applied_at: Date;
  reviewed_at?: Date;
  reviewed_by?: string;
  review_notes?: string;
}

export interface ProjectTeam {
  id: string;
  project_id: string;
  talent_id: string;
  role: 'MEMBER' | 'LEADER';
  joined_at: Date;
  is_active: boolean;
}

export interface ProjectChangeRequest {
  id: string;
  project_id: string;
  request_type: 'SCOPE' | 'CANCEL' | 'TIMELINE' | 'BUDGET' | 'TEAM';
  reason: string;
  details: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requested_by: string;
  reviewed_by?: string;
  reviewed_at?: Date;
  created_at: Date;
}

export interface ProjectCreateRequest {
  project_name: string;
  description: string;
  requirements: string;
  budget: number;
  duration_months: number;
  start_date?: Date;
  end_date?: Date;
  max_team_size: number;
  required_skills: string[];
}

export interface ProjectApplicationRequest {
  project_id: string;
  cover_letter: string;
}
