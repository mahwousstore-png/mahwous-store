import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, Clock, Download, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SupplierLedger } from '../types/mahwous_pro';
import { useUser } from '../contexts/UserContext';
import { useSystemLogs } from '../hooks/useSystemLogs';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

export default function SupplierLedgerPage() {
  const { user } = useUser();
  const { logAction } = useSystemLogs();
  const [ledgers, setLedgers] = useState<SupplierLedger[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid'>('all');

  useEffect(() => {
    fetchLedgers();
  }, []);

  const fetchLedgers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('supplier_ledger')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLedgers(data || []);
    } catch (error) {
      console.error('Error fetching ledgers:', error);
      toast.error('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (ledgerId: string, supplierName: string) => {
    if (!window.confirm('هل أنت متأكد من تسديد هذا المبلغ؟')) return;

    try {
      const { error } = await supabase
        .from('supplier_ledger')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', ledgerId);

      if (error) throw error;

      toast.success('تم تسديد المبلغ بنجاح');
      await logAction('تسديد دين مورد', `المورد: ${supplierName}`);
      fetchLedgers();
    } catch (error) {
      console.error('Error marking as paid:', error);
      toast.error('فشل تسديد المبلغ');
    }
  };

  const exportToExcel = () => {
    const exportData = ledgers.map(ledger => ({
      'اسم المورد': ledger.supplier_name,
      'المبلغ': ledger.amount,
      'رقم الطلب': ledger.order_number || '-',
      'أقفل بواسطة': ledger.closed_by,
      'الحالة': ledger.status === 'paid' ? 'مسدد' : 'معلق',
      'تاريخ الإنشاء': new Date(ledger.created_at).toLocaleDateString('ar-SA'),
      'تاريخ التسديد': ledger.paid_at ? new Date(ledger.paid_at).toLocaleDateString('ar-SA') : '-',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'دفتر الموردين');
    XLSX.writeFile(wb, `supplier_ledger_${new Date().toLocaleDateString('ar-SA')}.xlsx`);
    
    logAction('تصدير دفتر الموردين');
    toast.success('تم تصدير البيانات بنجاح');
  };

  // فلترة البيانات
  const filteredLedgers = ledgers.filter(ledger => {
    if (filterStatus === 'all') return true;
    return ledger.status === filterStatus;
  });

  // إحصائيات
  const stats = {
    total: ledgers.length,
    pending: ledgers.filter(l => l.status === 'pending').length,
    paid: ledgers.filter(l => l.status === 'paid').length,
    totalPending: ledgers
      .filter(l => l.status === 'pending')
      .reduce((sum, l) => sum + l.amount, 0),
    totalPaid: ledgers
      .filter(l => l.status === 'paid')
      .reduce((sum, l) => sum + l.amount, 0),
  };

  // تجميع حسب المورد
  const supplierSummary = ledgers.reduce((acc, ledger) => {
    if (!acc[ledger.supplier_name]) {
      acc[ledger.supplier_name] = {
        total: 0,
        pending: 0,
        paid: 0,
      };
    }
    acc[ledger.supplier_name].total += ledger.amount;
    if (ledger.status === 'pending') {
      acc[ledger.supplier_name].pending += ledger.amount;
    } else {
      acc[ledger.supplier_name].paid += ledger.amount;
    }
    return acc;
  }, {} as Record<string, { total: number; pending: number; paid: number }>);

  return (
    <div className="p-6 bg-black min-h-screen" dir="rtl">
      {/* العنوان */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#D4AF37] mb-2 flex items-center gap-3">
          <DollarSign className="w-10 h-10" />
          دفتر ديون الموردين
        </h1>
        <p className="text-gray-400">إدارة ومتابعة المستحقات المالية للموردين</p>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">إجمالي السجلات</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-200 text-sm">معلق</p>
              <p className="text-3xl font-bold text-white">{stats.pending}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm">مسدد</p>
              <p className="text-3xl font-bold text-white">{stats.paid}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-red-800 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-200 text-sm">إجمالي المعلق</p>
              <p className="text-2xl font-bold text-white">{stats.totalPending.toLocaleString()} ر.س</p>
            </div>
            <DollarSign className="w-10 h-10 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-black/70 text-sm">إجمالي المسدد</p>
              <p className="text-2xl font-bold text-black">{stats.totalPaid.toLocaleString()} ر.س</p>
            </div>
            <CheckCircle className="w-10 h-10 text-black/70" />
          </div>
        </div>
      </div>

      {/* ملخص الموردين */}
      <div className="bg-gray-900 rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold text-[#D4AF37] mb-4">ملخص الموردين</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(supplierSummary).map(([supplier, data]) => (
            <div key={supplier} className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2">{supplier}</h3>
              <div className="space-y-1 text-sm">
                <p className="text-gray-400">
                  إجمالي: <span className="text-white font-semibold">{data.total.toLocaleString()} ر.س</span>
                </p>
                <p className="text-yellow-400">
                  معلق: <span className="font-semibold">{data.pending.toLocaleString()} ر.س</span>
                </p>
                <p className="text-green-400">
                  مسدد: <span className="font-semibold">{data.paid.toLocaleString()} ر.س</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* الفلترة والتصدير */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'الكل' },
            { value: 'pending', label: 'معلق' },
            { value: 'paid', label: 'مسدد' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterStatus(filter.value as any)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === filter.value
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          تصدير Excel
        </button>
      </div>

      {/* جدول الديون */}
      <div className="bg-gray-900 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-4 text-right text-[#D4AF37]">اسم المورد</th>
              <th className="p-4 text-right text-[#D4AF37]">المبلغ</th>
              <th className="p-4 text-right text-[#D4AF37]">رقم الطلب</th>
              <th className="p-4 text-right text-[#D4AF37]">أقفل بواسطة</th>
              <th className="p-4 text-right text-[#D4AF37]">الحالة</th>
              <th className="p-4 text-right text-[#D4AF37]">تاريخ الإنشاء</th>
              <th className="p-4 text-right text-[#D4AF37]">تاريخ التسديد</th>
              <th className="p-4 text-center text-[#D4AF37]">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-400">
                  جاري التحميل...
                </td>
              </tr>
            ) : filteredLedgers.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-400">
                  لا توجد بيانات
                </td>
              </tr>
            ) : (
              filteredLedgers.map((ledger) => (
                <tr key={ledger.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                  <td className="p-4 text-white font-semibold">{ledger.supplier_name}</td>
                  <td className="p-4 text-[#D4AF37] font-bold">{ledger.amount.toLocaleString()} ر.س</td>
                  <td className="p-4 text-gray-300">{ledger.order_number || '-'}</td>
                  <td className="p-4 text-gray-300">{ledger.closed_by}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        ledger.status === 'paid'
                          ? 'bg-green-600 text-white'
                          : 'bg-yellow-600 text-white'
                      }`}
                    >
                      {ledger.status === 'paid' ? 'مسدد' : 'معلق'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300">
                    {new Date(ledger.created_at).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="p-4 text-gray-300">
                    {ledger.paid_at ? new Date(ledger.paid_at).toLocaleDateString('ar-SA') : '-'}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      {ledger.status === 'pending' && user?.role === 'admin' && (
                        <button
                          onClick={() => handleMarkAsPaid(ledger.id, ledger.supplier_name)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          تسديد
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ملاحظة */}
      <div className="mt-6 bg-blue-900/20 border border-blue-600 rounded-lg p-4">
        <p className="text-blue-400 text-sm">
          <strong>ملاحظة:</strong> يتم إضافة الديون تلقائياً عند إقفال الطلبات في نظام معالجة الطلبات.
        </p>
      </div>
    </div>
  );
}
