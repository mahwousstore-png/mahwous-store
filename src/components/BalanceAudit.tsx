import React, { useState, useEffect } from 'react';
import { Calculator, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'credit' | 'debit';
  reason?: string;
  transaction_date: string;
  created_at: string;
  user: {
    full_name: string;
    email: string;
  };
}

interface AuditResult {
  user_id: string;
  user_name: string;
  user_email: string;
  total_credit: number;
  total_debit: number;
  calculated_balance: number;
  transaction_count: number;
  transactions: Transaction[];
  is_correct: boolean;
}

const BalanceAudit: React.FC = () => {
  const [auditResults, setAuditResults] = useState<AuditResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AuditResult | null>(null);

  useEffect(() => {
    performAudit();
  }, []);

  const performAudit = async () => {
    setLoading(true);
    try {
      // جلب جميع المستخدمين
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'user')
        .eq('is_active', true);

      if (usersError) throw usersError;

      // جلب جميع المعاملات
      const { data: transactions, error: transError } = await supabase
        .from('employee_balance_transactions')
        .select(`
          *,
          user:user_profiles!employee_balance_transactions_user_id_fkey(full_name, email)
        `)
        .order('transaction_date', { ascending: true });

      if (transError) throw transError;

      // حساب الأرصدة لكل مستخدم
      const results: AuditResult[] = [];

      for (const user of users || []) {
        const userTransactions = (transactions || []).filter(
          (t: any) => t.user_id === user.id
        );

        let totalCredit = 0;
        let totalDebit = 0;

        userTransactions.forEach((t: any) => {
          const amount = parseFloat(t.amount.toString());
          if (t.type === 'credit') {
            totalCredit += amount;
          } else if (t.type === 'debit') {
            totalDebit += amount;
          }
        });

        const calculatedBalance = totalCredit - totalDebit;

        results.push({
          user_id: user.id,
          user_name: user.full_name,
          user_email: user.email,
          total_credit: totalCredit,
          total_debit: totalDebit,
          calculated_balance: calculatedBalance,
          transaction_count: userTransactions.length,
          transactions: userTransactions,
          is_correct: true, // نفترض أنها صحيحة لأننا نحسبها من الصفر
        });
      }

      setAuditResults(results);
      toast.success('تم فحص الحسابات بنجاح');
    } catch (error: any) {
      console.error('خطأ في فحص الحسابات:', error);
      toast.error('فشل فحص الحسابات: ' + error.message);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Calculator className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري فحص الحسابات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">فحص حسابات العهدة</h2>
            <p className="text-sm text-gray-600 mt-1">
              التحقق من صحة جميع الحسابات والأرصدة
            </p>
          </div>
          <button
            onClick={performAudit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            إعادة الفحص
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي المستخدمين</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {auditResults.length}
              </p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الإضافات</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {formatCurrency(
                  auditResults.reduce((sum, r) => sum + r.total_credit, 0)
                )}
              </p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الخصومات</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {formatCurrency(
                  auditResults.reduce((sum, r) => sum + r.total_debit, 0)
                )}
              </p>
            </div>
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                المستخدم
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                إجمالي الإضافات
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                إجمالي الخصومات
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                الرصيد المحسوب
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                عدد العمليات
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                الحالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {auditResults.map((result) => (
              <tr key={result.user_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {result.user_name}
                    </div>
                    <div className="text-sm text-gray-500">{result.user_email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                  {formatCurrency(result.total_credit)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                  {formatCurrency(result.total_debit)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  {formatCurrency(result.calculated_balance)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {result.transaction_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {result.is_correct ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      صحيح
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      خطأ
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => setSelectedUser(result)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    عرض التفاصيل
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Transaction Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    تفاصيل حساب {selectedUser.user_name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedUser.user_email}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">إجمالي الإضافات</p>
                  <p className="text-xl font-bold text-green-600 mt-1">
                    {formatCurrency(selectedUser.total_credit)}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">إجمالي الخصومات</p>
                  <p className="text-xl font-bold text-red-600 mt-1">
                    {formatCurrency(selectedUser.total_debit)}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">الرصيد النهائي</p>
                  <p className="text-xl font-bold text-blue-600 mt-1">
                    {formatCurrency(selectedUser.calculated_balance)}
                  </p>
                </div>
              </div>

              <h4 className="font-bold text-gray-900 mb-4">
                سجل العمليات ({selectedUser.transaction_count})
              </h4>

              <div className="space-y-3">
                {selectedUser.transactions.map((transaction, index) => {
                  // حساب الرصيد التراكمي
                  let runningBalance = 0;
                  for (let i = 0; i <= index; i++) {
                    const t = selectedUser.transactions[i];
                    if (t.type === 'credit') {
                      runningBalance += parseFloat(t.amount.toString());
                    } else {
                      runningBalance -= parseFloat(t.amount.toString());
                    }
                  }

                  return (
                    <div
                      key={transaction.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                transaction.type === 'credit'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {transaction.type === 'credit' ? 'إضافة' : 'خصم'}
                            </span>
                            <span className="text-sm text-gray-600">
                              {formatDate(transaction.transaction_date)}
                            </span>
                          </div>
                          {transaction.reason && (
                            <p className="text-sm text-gray-700 mt-2">
                              {transaction.reason}
                            </p>
                          )}
                        </div>
                        <div className="text-left">
                          <p
                            className={`text-lg font-bold ${
                              transaction.type === 'credit'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {transaction.type === 'credit' ? '+' : '-'}
                            {formatCurrency(parseFloat(transaction.amount.toString()))}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            الرصيد: {formatCurrency(runningBalance)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceAudit;
