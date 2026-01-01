export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type?: 'fixed' | 'variable';
  status?: 'pending' | 'approved' | 'rejected';
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  employee_balance_transaction_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExpenseStats {
  total_expenses: number;
  monthly_expenses: number;
  fixed_expenses: number;
  variable_expenses: number;
  categories_count: number;
}