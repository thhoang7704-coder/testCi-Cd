// Task & Report Types
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'CANCELLED';
export type ReportType = 'WEEKLY' | 'MONTHLY' | 'PHASE' | 'FINAL' | 'INCIDENT';
export type ReportStatus = 'DRAFT' | 'SUBMITTED' | 'REVIEWED' | 'APPROVED' | 'REJECTED';

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigned_to?: string;
  created_by: string;
  excel_template_url?: string;
  attachments?: string[];
  due_date?: Date;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  attachments?: string[];
  created_at: Date;
}

export interface Report {
  id: string;
  project_id: string;
  report_type: ReportType;
  title: string;
  content: string;
  status: ReportStatus;
  submitted_by: string;
  submitted_at?: Date;
  reviewed_by?: string;
  reviewed_at?: Date;
  review_notes?: string;
  attachments?: string[];
  period_start?: Date;
  period_end?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface TaskCreateRequest {
  project_id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigned_to?: string;
  excel_template_url?: string;
  due_date?: Date;
}

export interface ReportCreateRequest {
  project_id: string;
  report_type: ReportType;
  title: string;
  content: string;
  attachments?: string[];
  period_start?: Date;
  period_end?: Date;
}
