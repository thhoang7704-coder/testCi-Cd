// Company Types
export type CompanyStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface Company {
  id: string;
  company_name: string;
  tax_code: string;
  address: string;
  industry: string;
  website?: string;
  company_size: number;
  description?: string;
  contact_email: string;
  contact_phone?: string;
  status: CompanyStatus;
  rejection_reason?: string;
  validated_by?: string;
  validated_at?: Date;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface CompanyOnboardingRequest {
  company_name: string;
  tax_code: string;
  address: string;
  industry: string;
  website?: string;
  company_size: number;
  description?: string;
  contact_email: string;
  contact_phone?: string;
}
