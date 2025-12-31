import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, DollarSign, Users2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { authService } from '../lib/auth';
import toast from 'react-hot-toast';

interface PendingExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  created_by: string;
  created_at: string;
  status: 'pending';
  created_by_user: {
    full_name: string;
    email: string;
  };
}

interface PendingPayment {
  id: string;
  amount: number;
  payment_date: string;
  notes?: string;
  supplier_id: string;
  created_by: string;
  created_at: string;
  status: 'pending';
  supplier: {
    name: string;
    city: string;
  };
  created_by_user: {
    full_name: string;
    email: string;
  };
}

const PendingApprovals: React.FC = () => {
  const [pendingExpenses, setPendingExpenses] = useState<PendingExpense[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'expenses' | 'payments'>('expenses');
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const fetchPendingItems = async () => {
    setLoading(true);
    try {
      // جلب المصروفات المعلقة
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          *,
          created_by_user:user_profiles!expenses_created_by_fkey(full_name, email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (expensesError) throw expensesError;
      setPendingExpenses(expenses || []);

      // جلب سدادات الموردين المعلقة
      const { data: payments, error: paymentsError } = await supabase
        .from('supplier_payments')
        .select(`
          *,
          supplier:suppliers(name, city),
          created_by_user:user_profiles!supplier_payments_created_by_fkey(full_name, email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;
      setPendingPayments(payments || []);

      toast.success('تم تحميل العمليات المعلقة');
    } catch (error: any) {
      console.error('خطأ في جلب العمليات المعلقة:', error);
      toast.error('فشل تحميل العمليات المعلقة');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveExpense = async (expense: PendingExpense) => {
    if (!confirm(`هل أنت متأكد من تأكيد هذا المصروف؟\n\nالمبلغ: ${expense.amount} ر.س\nالموظف: ${expense.created_by_user.full_name}\n\nسيتم خصم المبلغ من عهدة الموظف تلقائياً.`)) {
      return;
    }

    try {
      // 1. تحديث حالة المصروف
      const { error: updateError } = await supabase
        .from('expenses')
        .update({
          status: 'approved',
          approved_by: currentUser?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', expense.id);

      if (updateError) throw updateError;

      // 2. خصم المبلغ من عهدة الموظف
      const { data: balanceTransaction, error: balanceError } = await supabase
        .from('employee_balance_transactions')
        .insert({
          user_id: expense.created_by,
          amount: expense.amount,
          type: 'debit',
          reason: `مصروف: ${expense.description} (${expense.category})`,
          transaction_date: expense.date,
          created_by: currentUser?.id
        })
        .select()
        .single();

      if (balanceError) throw balanceError;

      // 3. ربط المصروف بعملية خصم العهدة
      const { error: linkError } = await supabase
        .from('expenses')
        .update({
          employee_balance_transaction_id: balanceTransaction.id
        })
        .eq('id', expense.id);

      if (linkError) throw linkError;

      toast.success('تم تأكيد المصروف وخصم المبلغ من العهدة');
      fetchPendingItems();
    } catch (error: any) {
      console.error('خطأ في تأكيد المصروف:', error);
      toast.error('فشل تأكيد المصروف: ' + error.message);
    }
  };

  const handleRejectExpense = async (expense: PendingExpense) => {
    const reason = prompt('سبب الرفض (اختياري):');
    if (reason === null) return; // ألغى المستخدم

    try {
      const { error } = await supabase
        .from('expenses')
        .update({
          status: 'rejected',
          approved_by: currentUser?.id,
          approved_at: new Date().toISOString(),
          description: expense.description + (reason ? ` [مرفوض: ${reason}]` : ' [مرفوض]')
        })
        .eq('id', expense.id);

      if (error) throw error;

      toast.success('تم رفض المصروف');
      fetchPendingItems();
    } catch (error: any) {
      console.error('خطأ في رفض المصروف:', error);
      toast.error('فشل رفض المصروف');
    }
  };

  const handleApprovePayment = async (payment: PendingPayment) => {
    if (!confirm(`هل أنت متأكد من تأكيد هذا السداد؟\n\nالمبلغ: ${payment.amount} ر.س\nالمورد: ${payment.supplier.name}\nالموظف: ${payment.created_by_user.full_name}\n\nسيتم خصم المبلغ من عهدة الموظف وتحديث ديون المورد تلقائياً.`)) {
      return;
    }

    try {
      // 1. تحديث حالة السداد
      const { error: updateError } = await supabase
        .from('supplier_payments')
        .update({
          status: 'approved',
          approved_by: currentUser?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', payment.id);

      if (updateError) throw updateError;

      // 2. خصم المبلغ من عهدة الموظف
      const { data: balanceTransaction, error: balanceError } = await supabase
        .from('employee_balance_transactions')
        .insert({
          user_id: payment.created_by,
          amount: payment.amount,
          type: 'debit',
          reason: `سداد للمورد: ${payment.supplier.name}${payment.notes ? ` - ${payment.notes}` : ''}`,
          transaction_date: payment.payment_date,
          created_by: currentUser?.id
        })
        .select()
        .single();

      if (balanceError) throw balanceError;

      // 3. ربط السداد بعملية خصم العهدة
      const { error: linkError } = await supabase
        .from('supplier_payments')
        .update({
          employee_balance_transaction_id: balanceTransaction.id
        })
        .eq('id', payment.id);

      if (linkError) throw linkError;

      toast.success('تم تأكيد السداد وخصم المبلغ من العهدة');
      fetchPendingItems();
    } catch (error: any) {
      console.error('خطأ في تأكيد السداد:', error);
      toast.error('فشل تأكيد السداد: ' + error.message);
    }
  };

  const handleRejectPayment = async (payment: PendingPayment) => {
    const reason = prompt('سبب الرفض (اختياري):');
    if (reason === null) return;

    try {
      const { error } = await supabase
        .from('supplier_payments')
        .update({
          status: 'rejected',
          approved_by: currentUser?.id,
          approved_at: new Date().toISOString(),
          notes: payment.notes + (reason ? ` [مرفوض: ${reason}]` : ' [مرفوض]')
        })
        .eq('id', payment.id);

      if (error) throw error;

      toast.success('تم رفض السداد');
      fetchPendingItems();
    } catch (error: any) {
      console.error('خطأ في رفض السداد:', error);
      toast.error('فشل رفض السداد');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل العمليات المعلقة...</p>
        </div>
      </div>
    );
  }

  const totalPending = pendingExpenses.length + pendingPayments.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">مراجعة العمليات المعلقة</h2>
            <p className="text-sm text-gray-600 mt-1">
              تأكيد أو رفض المصروفات والسدادات قبل خصمها من العهدة
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-8 w-8 text-orange-600" />
            <div className="text-right">
              <p className="text-sm text-gray-600">إجمالي المعلق</p>
              <p className="text-2xl font-bold text-orange-600">{totalPending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm ${
                activeTab === 'expenses'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <DollarSign className="h-5 w-5" />
                <span>المصروفات ({pendingExpenses.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users2 className="h-5 w-5" />
                <span>سدادات الموردين ({pendingPayments.length})</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'expenses' && (
            <div className="space-y-4">
              {pendingExpenses.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <p className="text-gray-600">لا توجد مصروفات معلقة</p>
                </div>
              ) : (
                pendingExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                            بانتظار التأكيد
                          </span>
                          <span className="text-sm text-gray-600">
                            {formatDate(expense.date)}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {expense.description}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">الفئة: </span>
                            <span className="font-medium">{expense.category}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">الموظف: </span>
                            <span className="font-medium">
                              {expense.created_by_user.full_name}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">تاريخ الإنشاء: </span>
                            <span className="font-medium">
                              {formatDateTime(expense.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left mr-4">
                        <p className="text-2xl font-bold text-gray-900 mb-4">
                          {formatCurrency(expense.amount)}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveExpense(expense)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            تأكيد
                          </button>
                          <button
                            onClick={() => handleRejectExpense(expense)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                          >
                            <XCircle className="h-4 w-4" />
                            رفض
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-4">
              {pendingPayments.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <p className="text-gray-600">لا توجد سدادات معلقة</p>
                </div>
              ) : (
                pendingPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                            بانتظار التأكيد
                          </span>
                          <span className="text-sm text-gray-600">
                            {formatDate(payment.payment_date)}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          سداد للمورد: {payment.supplier.name}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">المدينة: </span>
                            <span className="font-medium">{payment.supplier.city}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">الموظف: </span>
                            <span className="font-medium">
                              {payment.created_by_user.full_name}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-600">تاريخ الإنشاء: </span>
                            <span className="font-medium">
                              {formatDateTime(payment.created_at)}
                            </span>
                          </div>
                          {payment.notes && (
                            <div className="col-span-2">
                              <span className="text-gray-600">ملاحظات: </span>
                              <span className="font-medium">{payment.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-left mr-4">
                        <p className="text-2xl font-bold text-gray-900 mb-4">
                          {formatCurrency(payment.amount)}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprovePayment(payment)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            تأكيد
                          </button>
                          <button
                            onClick={() => handleRejectPayment(payment)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                          >
                            <XCircle className="h-4 w-4" />
                            رفض
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingApprovals;
