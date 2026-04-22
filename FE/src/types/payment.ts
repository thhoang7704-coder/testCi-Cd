// Payment & Fund Types
export type PaymentType = 'INITIAL' | 'MILESTONE' | 'FINAL';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: string;
  project_id: string;
  payment_type: PaymentType;
  amount: number;
  currency: string;
  status: PaymentStatus;
  due_date?: Date;
  paid_at?: Date;
  invoice_number?: string;
  transaction_id?: string;
  notes?: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface FundAllocation {
  id: string;
  project_id: string;
  total_budget: number;
  lab_share: number; // 10%
  mentor_share: number; // 20%
  talent_share: number; // 70%
  created_by: string;
  created_at: Date;
}

export interface FundDistribution {
  id: string;
  fund_allocation_id: string;
  recipient_type: 'TALENT' | 'MENTOR';
  recipient_id: string;
  amount: number;
  distribution_type: 'SALARY' | 'BONUS' | 'INCENTIVE';
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED';
  approved_by?: string;
  approved_at?: Date;
  paid_at?: Date;
  created_at: Date;
}

export interface MentorPayment {
  id: string;
  mentor_id: string;
  project_id: string;
  amount: number;
  payment_type: 'MONTHLY' | 'FINAL' | 'BONUS';
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  due_date: Date;
  paid_at?: Date;
  notes?: string;
  created_at: Date;
}

export interface LabFundAdvance {
  id: string;
  project_id: string;
  advance_amount: number;
  advance_reason: string;
  status: 'PENDING' | 'ADVANCED' | 'SETTLED' | 'CANCELLED';
  requested_by: string;
  approved_by?: string;
  approved_at?: Date;
  settled_at?: Date;
  settlement_notes?: string;
  created_at: Date;
}

export interface PaymentCreateRequest {
  project_id: string;
  payment_type: PaymentType;
  amount: number;
  due_date?: Date;
  notes?: string;
}
