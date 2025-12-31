import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Trash2, Download, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Asset } from '../types/mahwous_pro';
import { useUser } from '../contexts/UserContext';
import { useSystemLogs } from '../hooks/useSystemLogs';
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

    try {
      const { error } = await supabase.from('assets').insert({
        name: formData.name,
        employee_name: formData.employee_name,
        price: parseFloat(formData.price),
        status: 'pending',
      });

      if (error) throw error;

      toast.success('تم إضافة الأصل بنجاح');
      await logAction('إضافة أصل', `اسم الأصل: ${formData.name}, الموظف: ${formData.employee_name}`);
      
      setFormData({ name: '', employee_name: '', price: '' });
      setShowAddModal(false);
      fetchAssets();
    } catch (error) {
      console.error('Error adding asset:', error);
      toast.error('فشل إضافة الأصل');
    }
  };

  const handleAcceptAsset = async (assetId: string, assetName: string) => {
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

      toast.success('تم اعتماد الأصل بنجاح');
      await logAction('اعتماد أصل', `اسم الأصل: ${assetName}`);
      fetchAssets();
    } catch (error) {
      console.error('Error accepting asset:', error);
      toast.error('فشل اعتماد الأصل');
    }
  };

  const handleRejectAsset = async (assetId: string, assetName: string) => {
    try {
      const { error } = await supabase
        .from('assets')
        .update({ status: 'rejected' })
        .eq('id', assetId);

      if (error) throw error;

      toast.success('تم رفض الأصل');
      await logAction('رفض أصل', `اسم الأصل: ${assetName}`);
      fetchAssets();
    } catch (error) {
      console.error('Error rejecting asset:', error);
      toast.error('فشل رفض الأصل');
    }
  };

  const handleDeleteAsset = async (assetId: string, assetName: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الأصل؟')) return;

    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetId);

      if (error) throw error;

      toast.success('تم حذف الأصل بنجاح');
      await logAction('حذف أصل', `اسم الأصل: ${assetName}`);
      fetchAssets();
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast.error('فشل حذف الأصل');
    }
  };

  const exportToExcel = () => {
    const exportData = assets.map(asset => ({
      'اسم الأصل': asset.name,
      'الموظف': asset.employee_name,
      'السعر': asset.price,
      'الحالة': asset.status === 'accepted' ? 'معتمد' : asset.status === 'rejected' ? 'مرفوض' : 'معلق',
      'تاريخ الإنشاء': new Date(asset.created_at).toLocaleDateString('ar-SA'),
      'تاريخ الاعتماد': asset.accepted_at ? new Date(asset.accepted_at).toLocaleDateString('ar-SA') : '-',
      'اعتمد بواسطة': asset.accepted_by || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الأصول');
    XLSX.writeFile(wb, `assets_${timeFilter}_${new Date().toLocaleDateString('ar-SA')}.xlsx`);
    
    logAction('تصدير بيانات الأصول', `الفترة: ${timeFilter}`);
    toast.success('تم تصدير البيانات بنجاح');
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
      textStyle: { color: '#D4AF37', fontSize: 18 },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      textStyle: { color: '#fff' },
    },
    series: [
      {
        name: 'الأصول',
        type: 'pie',
        radius: '50%',
        data: [
          { value: stats.accepted, name: 'معتمد', itemStyle: { color: '#10b981' } },
          { value: stats.pending, name: 'معلق', itemStyle: { color: '#f59e0b' } },
          { value: stats.rejected, name: 'مرفوض', itemStyle: { color: '#ef4444' } },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
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
        <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">إدارة الأصول والعهد</h1>
        <p className="text-gray-400">نظام ذكي لإدارة وتتبع الأصول والعهد</p>
      </div>

      {/* فلتر الوقت */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
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
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                timeFilter === filter.value
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Calendar className="w-4 h-4 inline-block ml-2" />
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            تصدير Excel
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#F4D03F] transition-all flex items-center gap-2 font-semibold"
            >
              <Plus className="w-4 h-4" />
              إضافة أصل جديد
            </button>
          )}
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">إجمالي الأصول</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm">معتمد</p>
              <p className="text-3xl font-bold text-white">{stats.accepted}</p>
            </div>
            <Check className="w-10 h-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-200 text-sm">معلق</p>
              <p className="text-3xl font-bold text-white">{stats.pending}</p>
            </div>
            <Calendar className="w-10 h-10 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-red-800 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-200 text-sm">مرفوض</p>
              <p className="text-3xl font-bold text-white">{stats.rejected}</p>
            </div>
            <X className="w-10 h-10 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-black/70 text-sm">القيمة الإجمالية</p>
              <p className="text-3xl font-bold text-black">{stats.totalValue.toLocaleString()} ر.س</p>
            </div>
            <TrendingDown className="w-10 h-10 text-black/70" />
          </div>
        </div>
      </div>

      {/* الرسم البياني */}
      <div className="bg-gray-900 p-6 rounded-xl mb-8">
        <ReactECharts option={chartOption} style={{ height: '400px' }} />
      </div>

      {/* جدول الأصول */}
      <div className="bg-gray-900 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-4 text-right text-[#D4AF37]">اسم الأصل</th>
              <th className="p-4 text-right text-[#D4AF37]">الموظف</th>
              <th className="p-4 text-right text-[#D4AF37]">السعر</th>
              <th className="p-4 text-right text-[#D4AF37]">الحالة</th>
              <th className="p-4 text-right text-[#D4AF37]">تاريخ الإنشاء</th>
              <th className="p-4 text-right text-[#D4AF37]">اعتمد بواسطة</th>
              <th className="p-4 text-center text-[#D4AF37]">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
                  جاري التحميل...
                </td>
              </tr>
            ) : paginatedAssets.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
                  لا توجد بيانات
                </td>
              </tr>
            ) : (
              paginatedAssets.map((asset) => (
                <tr key={asset.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                  <td className="p-4 text-white">{asset.name}</td>
                  <td className="p-4 text-gray-300">{asset.employee_name}</td>
                  <td className="p-4 text-gray-300">{asset.price.toLocaleString()} ر.س</td>
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
                  <td className="p-4 text-gray-300">
                    {new Date(asset.created_at).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="p-4 text-gray-300">{asset.accepted_by || '-'}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      {asset.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAcceptAsset(asset.id, asset.name)}
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                            title="اعتماد"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRejectAsset(asset.id, asset.name)}
                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                            title="رفض"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleDeleteAsset(asset.id, asset.name)}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 bg-gray-800">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              السابق
            </button>
            <span className="text-white">
              صفحة {currentPage} من {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              التالي
            </button>
          </div>
        )}
      </div>

      {/* نافذة إضافة أصل */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-[#D4AF37] mb-6">إضافة أصل جديد</h2>
            <form onSubmit={handleAddAsset} className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">اسم الأصل</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-[#D4AF37] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2">اسم الموظف</label>
                <input
                  type="text"
                  value={formData.employee_name}
                  onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                  className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-[#D4AF37] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2">السعر (ر.س)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-[#D4AF37] focus:outline-none"
                  required
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#D4AF37] text-black rounded-lg hover:bg-[#F4D03F] transition-all font-semibold"
                >
                  إضافة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
