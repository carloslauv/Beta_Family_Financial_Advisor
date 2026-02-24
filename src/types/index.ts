// Core user profile
export interface User {
  id: string;
  email: string;
  name: string;
  partner_name?: string;
  created_at: Date;
}

// Intake responses stored as structured JSON
export interface IntakeData {
  id?: string;
  user_id?: string;
  completed_at?: Date;
  version?: number;

  basics: {
    user_age: number;
    partner_age?: number;
    kids: Array<{ age: number; name?: string }>;
    parents: Array<{ age: number; relationship: string }>;
    has_business: boolean;
  };

  retirement: {
    total_savings_range: string;
    total_savings_estimate: number;
    monthly_contribution: number;
    employer_match?: number;
    target_retirement_age: number;
    desired_lifestyle: 'modest' | 'similar' | 'comfortable' | 'unsure';
    has_pension: boolean | null;
    other_assets_notes?: string;
  };

  education?: {
    plans: Array<{
      child_index: number;
      goal: 'public' | 'private' | 'trade' | 'unsure';
      current_savings_range: string;
      current_savings_estimate: number;
      monthly_contribution: number;
    }>;
    family_contribution: boolean | null;
    financial_aid: boolean | null;
  };

  career: {
    path: 'founder' | 'employee';
    annual_income: number;
    // Founder-specific
    equity_value_range?: string;
    equity_value_estimate?: number;
    considering_exit?: boolean | null;
    exit_timeline?: string;
    has_vc?: boolean;
    profitable?: boolean;
    // Employee-specific
    income_stability?: 'very_stable' | 'somewhat' | 'uncertain';
    considering_change?: boolean | null;
    stock_options_value?: number;
  };

  parents: {
    financial_independence: 'fully' | 'mostly' | 'partially' | 'significantly';
    ltc_insurance: boolean | null;
    care_likelihood: 'no' | 'possibly' | 'likely' | 'already';
    primary_responsibility: boolean | null;
    monthly_contribution: number;
  };

  monthly: {
    household_income_monthly: number;
    essential_expenses: number;
    discretionary_spending: number;
    emergency_months: string;
    emergency_months_value: number;
    total_debt_non_mortgage: number;
    mortgage_rent: number;
  };
}

export type IntakeSection =
  | 'basics'
  | 'retirement'
  | 'education'
  | 'career'
  | 'parents'
  | 'monthly';

export interface DimensionResult {
  status: 'on_track' | 'needs_attention' | 'behind' | 'uncertain' | 'unplanned';
  score: number; // 0-100
  metrics: Array<{
    label: string;
    value: string;
    color: 'good' | 'warn' | 'alert' | 'neutral';
  }>;
  connection_to: string;
  connection_text: string;
}

export interface AIContent {
  retirement_summary: string;
  education_summary: string;
  career_summary: string;
  parents_summary: string;
  monthly_summary: string;
  interconnections: Array<{
    icon: string;
    headline: string;
    body: string;
  }>;
  priorities: Array<{
    level: 'high' | 'medium' | 'low' | 'keep';
    text: string;
    action_teaser: string;
  }>;
}

// Generated panorama output
export interface Panorama {
  id: string;
  intake_id?: string;
  generated_at: Date;
  user_name?: string;

  // Computed summary
  net_worth_estimate: number;
  monthly_cash_flow: number;
  savings_rate: number;
  overall_readiness_score: number; // 0-100
  overall_readiness_label: string;

  // Per-dimension computed data
  dimensions: {
    retirement: DimensionResult;
    education: DimensionResult;
    career: DimensionResult;
    parents: DimensionResult;
    monthly: DimensionResult;
  };

  // AI-generated content
  ai_narratives: AIContent;
}

export interface ComputedMetrics {
  net_worth: number;
  monthly_cash_flow: number;
  savings_rate: number;
  retirement_projected: number;
  retirement_target: number;
  retirement_percentage: number;
  years_to_retirement: number;
  education_funded_percentage: number;
  education_total_needed: number;
  education_total_saved: number;
  monthly_total_savings: number;
  monthly_surplus_deficit: number;
  emergency_fund_months: number;
  parent_care_risk: 'low' | 'medium' | 'high';
  dimension_scores: {
    retirement: number;
    education: number;
    career: number;
    parents: number;
    monthly: number;
  };
  overall_score: number;
}

// Question types for intake
export type QuestionType =
  | 'text'
  | 'number'
  | 'range_select'
  | 'single_choice'
  | 'slider'
  | 'yes_no'
  | 'multi_age';

export interface Question {
  id: string;
  text: string;
  helper?: string;
  type: QuestionType;
  options?: Array<{ label: string; value: string | number | boolean }>;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number | string;
  placeholder?: string;
  skippable?: boolean;
  conditionalOn?: {
    field: string;
    value: unknown;
  };
}
