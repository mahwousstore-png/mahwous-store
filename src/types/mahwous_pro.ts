// نوع بيانات الأصول والعهد
export interface Asset {
  id: string;
  name: string;
  employee_name: string;
  price: number;
  status: 'pending' | 'accepted' | 'rejected';
  accepted_at?: string;
  accepted_by?: string;
  created_at: string;
  updated_at: string;
}

// نوع بيانات سجل الأحداث (الصندوق الأسود)
export interface SystemLog {
  id: string;
  user_name: string;
  user_role: 'admin' | 'employee';
  action: string;
  details?: string;
  created_at: string;
}

// نوع بيانات دفتر الموردين
export interface SupplierLedger {
  id: string;
  supplier_name: string;
  amount: number;
  order_number?: string;
  closed_by: string;
  status: 'pending' | 'paid';
  created_at: string;
  paid_at?: string;
}

// نوع بيانات المستخدم
export interface UserRole {
  role: 'admin' | 'employee';
  name: string;
}
