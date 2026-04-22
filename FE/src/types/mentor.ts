// Mentor Types
export type MentorStatus = 'ACTIVE' | 'INACTIVE' | 'BUSY';

export interface Mentor {
  id: string;
  user_id: string;
  expertise: string[];
  years_experience: number;
  bio?: string;
  company_affiliation?: string;
  linkedin_url?: string;
  status: MentorStatus;
  rating?: number;
  total_projects: number;
  created_at: Date;
  updated_at: Date;
}

export interface MentorProfileRequest {
  expertise: string[];
  years_experience: number;
  bio?: string;
  company_affiliation?: string;
  linkedin_url?: string;
}
