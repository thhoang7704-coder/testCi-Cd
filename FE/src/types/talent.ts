// Talent Types
export type TalentStatus = 'ACTIVE' | 'INACTIVE' | 'GRADUATED';

export interface Talent {
  id: string;
  user_id: string;
  student_code: string;
  major: string;
  year: number;
  gpa?: number;
  skills: string[];
  certifications?: string[];
  portfolio_url?: string;
  github_url?: string;
  linkedin_url?: string;
  bio?: string;
  status: TalentStatus;
  is_leader: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TalentProfileRequest {
  student_code: string;
  major: string;
  year: number;
  gpa?: number;
  skills: string[];
  certifications?: string[];
  portfolio_url?: string;
  github_url?: string;
  linkedin_url?: string;
  bio?: string;
}
