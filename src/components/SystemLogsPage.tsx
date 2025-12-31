import React, { useState, useEffect } from 'react';
import { Eye, Search, Calendar, User, Activity } from 'lucide-react';
import { SystemLog } from '../types/mahwous_pro';
import { useSystemLogs } from '../hooks/useSystemLogs';
import { useUser } from '../contexts/UserContext';

export default function SystemLogsPage() {
  const { user } = useUser();
  const { getSystemLogs } = useSystemLogs();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'employee'>('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const data = await getSystemLogs();
    setLogs(data);
    setLoading(false);
  };

  // فلترة السجلات
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = filterRole === 'all' || log.user_role === filterRole;

    return matchesSearch && matchesRole;
  });

  // إحصائيات
  const stats = {
    total: logs.length,
    admin: logs.filter(l => l.user_role === 'admin').length,
    employee: logs.filter(l => l.user_role === 'employee').length,
    today: logs.filter(l => {
      const logDate = new Date(l.created_at);
      const today = new Date();
      return logDate.toDateString() === today.toDateString();
    }).length,
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4" dir="rtl">
        <div className="bg-red-900/20 border-2 border-red-600 rounded-xl p-8 max-w-md text-center">
          <Eye className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">وصول محظور</h2>
          <p className="text-gray-400">هذه الصفحة متاحة للمدير فقط</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-black min-h-screen" dir="rtl">
      {/* العنوان */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#D4AF37] mb-2 flex items-center gap-3">
          <Eye className="w-10 h-10" />
          الصندوق الأسود - سجل الأحداث
        </h1>
        <p className="text-gray-400">مراقبة ورصد جميع العمليات والأنشطة في النظام</p>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">إجمالي السجلات</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <Activity className="w-10 h-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-black/70 text-sm">عمليات المدير</p>
              <p className="text-3xl font-bold text-black">{stats.admin}</p>
            </div>
            <User className="w-10 h-10 text-black/70" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm">عمليات الموظفين</p>
              <p className="text-3xl font-bold text-white">{stats.employee}</p>
            </div>
            <User className="w-10 h-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">اليوم</p>
              <p className="text-3xl font-bold text-white">{stats.today}</p>
            </div>
            <Calendar className="w-10 h-10 text-purple-200" />
          </div>
        </div>
      </div>

      {/* البحث والفلترة */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث في السجلات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-3 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-[#D4AF37] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-2">
          {[
            { value: 'all', label: 'الكل' },
            { value: 'admin', label: 'المدير' },
            { value: 'employee', label: 'الموظفين' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterRole(filter.value as any)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterRole === filter.value
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* جدول السجلات */}
      <div className="bg-gray-900 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-4 text-right text-[#D4AF37]">التاريخ والوقت</th>
              <th className="p-4 text-right text-[#D4AF37]">المستخدم</th>
              <th className="p-4 text-right text-[#D4AF37]">الدور</th>
              <th className="p-4 text-right text-[#D4AF37]">الإجراء</th>
              <th className="p-4 text-right text-[#D4AF37]">التفاصيل</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  جاري التحميل...
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  لا توجد سجلات
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                  <td className="p-4 text-gray-300">
                    <div className="flex flex-col">
                      <span>{new Date(log.created_at).toLocaleDateString('ar-SA')}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(log.created_at).toLocaleTimeString('ar-SA')}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-white font-semibold">{log.user_name}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        log.user_role === 'admin'
                          ? 'bg-[#D4AF37] text-black'
                          : 'bg-green-600 text-white'
                      }`}
                    >
                      {log.user_role === 'admin' ? 'مدير' : 'موظف'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300 font-semibold">{log.action}</td>
                  <td className="p-4 text-gray-400 text-sm">{log.details || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ملاحظة */}
      <div className="mt-6 bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
        <p className="text-yellow-400 text-sm">
          <strong>ملاحظة:</strong> جميع العمليات مسجلة ولا يمكن حذفها أو تعديلها. هذا النظام مصمم للشفافية والمساءلة.
        </p>
      </div>
    </div>
  );
}
