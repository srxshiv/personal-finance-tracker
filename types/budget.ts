export interface Budget {
  _id: string;
  category: string;
  amount: number;
  month: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetFormData {
  category: string;
  amount: string;
  month: string;
}

export interface BudgetComparison {
  category: string;
  budgeted: number;
  actual: number;
  remaining: number;
  percentage: number;
  status: 'under' | 'over' | 'on-track';
}

export interface SpendingInsight {
  type: 'trend' | 'warning' | 'achievement' | 'tip';
  title: string;
  description: string;
  value?: string;
  category?: string;
}