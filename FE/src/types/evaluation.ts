// Evaluation Types
export type EvaluationType = 'MENTOR_TO_TALENT' | 'TALENT_TO_MENTOR' | 'COMPANY_TO_PROJECT' | 'COMPANY_TO_MENTOR' | 'COMPANY_TO_TALENT';

export interface Evaluation {
  id: string;
  evaluator_id: string;
  evaluatee_id: string;
  project_id?: string;
  evaluation_type: EvaluationType;
  rating: number; // 1-5
  feedback: string;
  strengths?: string[];
  improvements?: string[];
  created_at: Date;
}

export interface MentorCandidateReview {
  id: string;
  mentor_id: string;
  talent_id: string;
  project_id: string;
  technical_rating: number;
  communication_rating: number;
  teamwork_rating: number;
  overall_rating: number;
  strengths: string;
  weaknesses: string;
  recommendation: 'STRONG_RECOMMEND' | 'RECOMMEND' | 'NEUTRAL' | 'NOT_RECOMMEND';
  notes?: string;
  reviewed_at: Date;
}

export interface MentorInvitation {
  id: string;
  mentor_id: string;
  project_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  invited_by: string;
  invited_at: Date;
  responded_at?: Date;
  response_notes?: string;
}

export interface ProjectMentor {
  id: string;
  project_id: string;
  mentor_id: string;
  role: 'MAIN_MENTOR' | 'ASSISTANT_MENTOR';
  assigned_at: Date;
  is_active: boolean;
}

export interface EvaluationCreateRequest {
  evaluatee_id: string;
  project_id?: string;
  evaluation_type: EvaluationType;
  rating: number;
  feedback: string;
  strengths?: string[];
  improvements?: string[];
}

export interface MentorCandidateReviewRequest {
  talent_id: string;
  project_id: string;
  technical_rating: number;
  communication_rating: number;
  teamwork_rating: number;
  overall_rating: number;
  strengths: string;
  weaknesses: string;
  recommendation: 'STRONG_RECOMMEND' | 'RECOMMEND' | 'NEUTRAL' | 'NOT_RECOMMEND';
  notes?: string;
}
