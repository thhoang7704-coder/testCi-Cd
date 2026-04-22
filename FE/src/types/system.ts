// System Management Types
export interface Setting {
  id: string;
  key: string;
  value: string;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  description?: string;
  is_public: boolean;
  updated_by: string;
  updated_at: Date;
}

export interface ExcelTemplate {
  id: string;
  name: string;
  type: 'TASK' | 'REPORT' | 'EVALUATION' | 'BUDGET';
  version: string;
  active: boolean;
  file_url: string;
  download_count: number;
  description?: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'WELCOME' | 'INVITATION' | 'REMINDER' | 'NOTIFICATION' | 'REPORT';
  variables: string[]; // Available variables for template
  active: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  is_read: boolean;
  action_url?: string;
  data?: Record<string, any>;
  created_at: Date;
  read_at?: Date;
}

export interface Contribution {
  id: string;
  user_id: string;
  project_id: string;
  task_id?: string;
  contribution_type: 'CODE' | 'DESIGN' | 'DOCUMENTATION' | 'TESTING' | 'MENTORING' | 'LEADERSHIP';
  description: string;
  hours_spent?: number;
  impact_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  verified_by?: string;
  verified_at?: Date;
  created_at: Date;
}

export interface RiskRecord {
  id: string;
  project_id: string;
  risk_type: 'TECHNICAL' | 'RESOURCE' | 'TIMELINE' | 'BUDGET' | 'QUALITY' | 'EXTERNAL';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  impact: string;
  mitigation_plan?: string;
  status: 'IDENTIFIED' | 'MITIGATED' | 'CLOSED' | 'ESCALATED';
  identified_by: string;
  assigned_to?: string;
  resolved_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface TeamVote {
  id: string;
  project_id: string;
  proposal_id: string;
  proposal_type: 'BUDGET_ALLOCATION' | 'TASK_PRIORITY' | 'MILESTONE' | 'TEAM_DECISION';
  proposal_title: string;
  proposal_description: string;
  options: string[]; // Voting options
  votes: Record<string, string>; // user_id -> selected_option
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
  created_by: string;
  deadline: Date;
  created_at: Date;
  closed_at?: Date;
}
