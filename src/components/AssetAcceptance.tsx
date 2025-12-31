import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Trash2, Download, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Asset } from '../types/mahwous_pro';
import { useUser } from '../contexts/UserContext';
import { useSystemLogs } from '../hooks/useSystemLogs';
import { formatSmartDate, formatTableDate } from '../utils/dateFormatter';
import Button from './ui/Button';
import toast from 'react-hot-toast';
import ReactECharts from 'echarts-for-react';
import * as XLSX from 'xlsx';

type TimeFilter = 'day' | 'week' | 'month' | 'year' | 'all';

export default function AssetAcceptance() {
  const { user } = useUser();
  const { logAction } = useSystemLogs();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const itemsPerPage = 7;

  // حالة النموذج
  const [formData, setFormData] = useState({
    name: '',
    employee_name: '',
    price: '',
  });

  useEffect(() => {
    fetchAssets();
  }, [timeFilter]);

  const getDateFilter = () => {
    const now = new Date();
    switch (timeFilter) {
      case 'day':
        return new Date(now.setDate(now.getDate() - 1)).toISOString();
      case 'week':
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
      default:
        return null;
    }
  };

  const fetchAssets = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });

      const dateFilter = getDateFilter();
      if (dateFilter) {
        query = query.gte('created_at', dateFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast.error('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.employee_name || !formData.price) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }

    setActionLoading('add');

    try {
      const { error } = await supabase.from('assets').insert({
        name: formData.name,
        employee_name: formData.employee_name,
        price: parseFloat(formData.price),
        status: 'pending',
      });

      if (error) throw error;

      toast.success('✅ تم إضافة الأصل بنجاح');
      await logAction('إضافة أصل', `اسم الأصل: ${formData.name}, الموظف: ${formData.employee_name}`);
      
      setFormData({ name: '', employee_name: '', price: '' });
      setShowAddModal(false);
      fetchAssets();
    } catch (error) {
      console.error('Error adding asset:', error);
      toast.error('❌ فشل إضافة الأصل');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAcceptAsset = async (assetId: string, assetName: string) => {
    setActionLoading(`accept-${assetId}`);

    try {
      const { error } = await supabase
        .from('assets')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          accepted_by: user?.name,
        })
        .eq('id', assetId);

      if (error) throw error;

      toast.success('✅ تم اعتماد الأصل بنجاح');
      await logAction('اعتماد أصل', `اسم الأصل: ${assetName}`);
      fetchAssets();
    } catch (error) {
      console.error('Error accepting asset:', error);
      toast.error('❌ فشل اعتماد الأصل');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectAsset = async (assetId: string, assetName: string) => {
    setActionLoading(`reject-${assetId}`);

    try {
      const { error } = await supabase
        .from('assets')
        .update({ status: 'rejected' })
        .eq('id', assetId);

      if (error) throw error;

      toast.success('✅ تم رفض الأصل');
      await logAction('رفض أصل', `اسم الأصل: ${assetName}`);
      fetchAssets();
    } catch (error) {
      console.error('Error rejecting asset:', error);
      toast.error('❌ فشل رفض الأصل');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAsset = async (assetId: string, assetName: string) => {
    if (!window.confirm('⚠️ هل أنت متأكد من حذف هذا الأصل؟ لا يمكن التراجع عن هذا الإجراء.')) return;

    setActionLoading(`delete-${assetId}`);

    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetId);

      if (error) throw error;

      toast.success('✅ تم حذف الأصل بنجاح');
      await logAction('حذف أصل', `اسم الأصل: ${assetName}`);
      fetchAssets();
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast.error('❌ فشل حذف الأصل');
    } finally {
      setActionLoading(null);
    }
  };

  const exportToExcel = () => {
    const exportData = assets.map(asset => ({
      'اسم الأصل': asset.name,
      'الموظف': asset.employee_name,
      'السعر': asset.price,
      'الحالة': asset.status === 'accepted' ? 'معتمد' : asset.status === 'rejected' ? 'مرفوض' : 'معلق',
      'تاريخ الإنشاء': formatTableDate(asset.created_at),
      'تاريخ الاعتماد': asset.accepted_at ? formatTableDate(asset.accepted_at) : '-',
      'اعتمد بواسطة': asset.accepted_by || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الأصول');
    XLSX.writeFile(wb, `assets_${timeFilter}_${new Date().toLocaleDateString('ar-SA')}.xlsx`);
    
    logAction('تصدير بيانات الأصول', `الفترة: ${timeFilter}`);
    toast.success('✅ تم تصدير البيانات بنجاح');
  };

  // إحصائيات
  const stats = {
    total: assets.length,
    accepted: assets.filter(a => a.status === 'accepted').length,
    pending: assets.filter(a => a.status === 'pending').length,
    rejected: assets.filter(a => a.status === 'rejected').length,
    totalValue: assets.reduce((sum, a) => sum + a.price, 0),
  };

  // بيانات الرسم البياني
  const chartOption = {
    title: {
      text: 'نسبة الأصول حسب الحالة',
      left: 'center',
      textStyle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
      backgroundColor: '#1f2937',
      borderColor: '#D4AF37',
      textStyle: { color: '#fff' },
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: '#fff' },
    },
    series: [
      {
        name: 'الأصول',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#000',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
            color: '#D4AF37',
          },
        },
        data: [
          { value: stats.accepted, name: 'معتمد', itemStyle: { color: '#10b981' } },
          { value: stats.pending, name: 'معلق', itemStyle: { color: '#f59e0b' } },
          { value: stats.rejected, name: 'مرفوض', itemStyle: { color: '#ef4444' } },
        ],
      },
    ],
  };

  // Pagination
  const totalPages = Math.ceil(assets.length / itemsPerPage);
  const paginatedAssets = assets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 bg-black min-h-screen" dir="rtl">
      {/* العنوان */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] mb-2">
          إدارة الأصول والعهد
        </h1>
        <p className="text-gray-400">نظام ذكي لإدارة وتتبع الأصول والعهد مع رقابة كاملة</p>
      </div>

      {/* فلتر الوقت */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'day', label: 'يومي' },
            { value: 'week', label: 'أسبوعي' },
            { value: 'month', label: 'شهري' },
            { value: 'year', label: 'سنوي' },
            { value: 'all', label: 'الكل' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => {
                setTimeFilter(filter.value as TimeFilter);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-all active:scale-95 ${
                timeFilter === filter.value
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black shadow-lg'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4 inline-block ml-2" />
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant="secondary"
            icon={<Download className="w-4 h-4" />}
            onClick={exportToExcel}
          >
            تصدير Excel
          </Button>

          {user?.role === 'admin' && (
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowAddModal(true)}
            >
              إضافة أصل جديد
            </Button>
          )}
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">إجمالي الأصول</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-xl shadow-lg hover:shadow-green-500/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm">معتمد</p>
              <p className="text-3xl font-bold text-white">{stats.accepted}</p>
            </div>
            <Check className="w-10 h-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 p-6 rounded-xl shadow-lg hover:shadow-yellow-500/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-200 text-sm">معلق</p>
              <p className="text-3xl font-bold text-white">{stats.pending}</p>
            </div>
            <Calendar className="w-10 h-10 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-red-800 p-6 rounded-xl shadow-lg hover:shadow-red-500/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-200 text-sm">مرفوض</p>
              <p className="text-3xl font-bold text-white">{stats.rejected}</p>
            </div>
            <X className="w-10 h-10 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] p-6 rounded-xl shadow-lg hover:shadow-[#D4AF37]/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-black/70 text-sm">القيمة الإجمالية</p>
              <p className="text-2xl font-bold text-black">{stats.totalValue.toLocaleString()} ر.س</p>
            </div>
            <TrendingDown className="w-10 h-10 text-black/70" />
          </div>
        </div>
      </div>

      {/* الرسم البياني */}
      <div className="bg-gray-900 p-6 rounded-xl mb-8 border border-[#D4AF37]/20 shadow-xl">
        <ReactECharts option={chartOption} style={{ height: '400px' }} />
      </div>

      {/* جدول الأصول */}
      <div className="bg-gray-900 rounded-xl overflow-hidden border border-[#D4AF37]/20 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-4 text-right text-[#D4AF37] font-bold">اسم الأصل</th>
                <th className="p-4 text-right text-[#D4AF37] font-bold">الموظف</th>
                <th className="p-4 text-right text-[#D4AF37] font-bold">السعر</th>
                <th className="p-4 text-right text-[#D4AF37] font-bold">الحالة</th>
                <th className="p-4 text-right text-[#D4AF37] font-bold">تاريخ الإنشاء</th>
                <th className="p-4 text-right text-[#D4AF37] font-bold">اعتمد بواسطة</th>
                <th className="p-4 text-center text-[#D4AF37] font-bold">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#D4AF37] border-t-transparent"></div>
                    <p className="mt-2">جاري التحميل...</p>
                  </td>
                </tr>
              ) : paginatedAssets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    <p className="text-lg">لا توجد بيانات</p>
                  </td>
                </tr>
              ) : (
                paginatedAssets.map((asset) => {
                  const dateInfo = formatSmartDate(asset.created_at);
                  return (
                    <tr key={asset.id} className="border-t border-gray-800 hover:bg-gray-800/50 transition-all">
                      <td className="p-4 text-white font-semibold">{asset.name}</td>
                      <td className="p-4 text-gray-300">{asset.employee_name}</td>
                      <td className="p-4 text-[#D4AF37] font-bold">{asset.price.toLocaleString()} ر.س</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            asset.status === 'accepted'
                              ? 'bg-green-600 text-white'
                              : asset.status === 'rejected'
                              ? 'bg-red-600 text-white'
                              : 'bg-yellow-600 text-white'
                          }`}
                        >
                          {asset.status === 'accepted' ? 'معتمد' : asset.status === 'rejected' ? 'مرفوض' : 'معلق'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-300" title={dateInfo.tooltip}>
                        {dateInfo.display}
                      </td>
                      <td className="p-4 text-gray-300">{asset.accepted_by || '-'}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          {asset.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="primary"
                                icon={<Check className="w-4 h-4" />}
                                onClick={() => handleAcceptAsset(asset.id, asset.name)}
                                loading={actionLoading === `accept-${asset.id}`}
                                disabled={!!actionLoading}
                              >
                                اعتماد
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                icon={<X className="w-4 h-4" />}
                                onClick={() => handleRejectAsset(asset.id, asset.name)}
                                loading={actionLoading === `reject-${asset.id}`}
                                disabled={!!actionLoading}
                              >
                                رفض
                              </Button>
                            </>
                          )}
                          {user?.role === 'admin' && (
                            <Button
                              size="sm"
                              variant="danger"
                              icon={<Trash2 className="w-4 h-4" />}
                              onClick={() => handleDeleteAsset(asset.id, asset.name)}
                              loading={actionLoading === `delete-${asset.id}`}
                              disabled={!!actionLoading}
                            >
                              حذف
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 bg-gray-800 border-t border-[#D4AF37]/20">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              السابق
            </Button>
            <span className="text-white px-4">
              صفحة {currentPage} من {totalPages}
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              التالي
            </Button>
          </div>
        )}
      </div>

      {/* نافذة إضافة أصل */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full border border-[#D4AF37]/20 shadow-2xl">
            <h2 className="text-2xl font-bold text-[#D4AF37] mb-6">إضافة أصل جديد</h2>
            <form onSubmit={handleAddAsset} className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2 font-semibold">اسم الأصل</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 transition-all"
                  required
                  placeholder="مثال: لابتوب HP"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2 font-semibold">اسم الموظف</label>
                <input
                  type="text"
                  value={formData.employee_name}
                  onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                  className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 transition-all"
                  required
                  placeholder="مثال: أحمد محمد"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2 font-semibold">السعر (ر.س)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 transition-all"
                  required
                  placeholder="مثال: 3500"
                />
              </div>
              <div className="flex gap-4 mt-6">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  loading={actionLoading === 'add'}
                  disabled={!!actionLoading}
                >
                  إضافة
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowAddModal(false)}
                  disabled={!!actionLoading}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
