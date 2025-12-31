import React from 'react';
import { Shield, Users } from 'lucide-react';

interface RoleSelectionProps {
  onSelectRole: (role: 'admin' | 'employee') => void;
}

export default function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-4xl w-full">
        {/* الشعار */}
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] p-4 rounded-full mb-6">
            <Shield className="w-16 h-16 text-black" />
          </div>
          <h1 className="text-5xl font-bold text-[#D4AF37] mb-2">مهووس برو</h1>
          <p className="text-gray-400 text-lg">نظام إدارة متقدم للعطور الفاخرة</p>
        </div>

        {/* اختيار الدور */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* المدير */}
          <button
            onClick={() => onSelectRole('admin')}
            className="group relative bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] p-8 rounded-2xl hover:scale-105 transform transition-all duration-300 shadow-2xl hover:shadow-[#D4AF37]/50"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-black/20 p-6 rounded-full mb-6 group-hover:bg-black/30 transition-all">
                <Shield className="w-20 h-20 text-black" />
              </div>
              <h2 className="text-3xl font-bold text-black mb-3">مدير النظام</h2>
              <p className="text-black/80 text-lg">
                تحكم كامل في جميع الوظائف والصلاحيات
              </p>
              <ul className="mt-6 space-y-2 text-black/70 text-right w-full">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-black rounded-full"></span>
                  إضافة وحذف العهد والمصروفات
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-black rounded-full"></span>
                  عرض الأرباح والتقارير المالية
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-black rounded-full"></span>
                  الوصول إلى سجل الأحداث
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-black rounded-full"></span>
                  إدارة الطلبات والموردين
                </li>
              </ul>
            </div>
          </button>

          {/* الموظف */}
          <button
            onClick={() => onSelectRole('employee')}
            className="group relative bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl hover:scale-105 transform transition-all duration-300 shadow-2xl border-2 border-[#D4AF37] hover:border-[#F4D03F]"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-[#D4AF37]/20 p-6 rounded-full mb-6 group-hover:bg-[#D4AF37]/30 transition-all">
                <Users className="w-20 h-20 text-[#D4AF37]" />
              </div>
              <h2 className="text-3xl font-bold text-[#D4AF37] mb-3">موظف</h2>
              <p className="text-gray-400 text-lg">
                عرض واعتماد العهد والمصروفات فقط
              </p>
              <ul className="mt-6 space-y-2 text-gray-400 text-right w-full">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#D4AF37] rounded-full"></span>
                  عرض العهد والمصروفات
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#D4AF37] rounded-full"></span>
                  اعتماد العهد (بدون تراجع)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#D4AF37] rounded-full"></span>
                  ممنوع من الحذف
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#D4AF37] rounded-full"></span>
                  لا يرى الأرباح أو التقارير
                </li>
              </ul>
            </div>
          </button>
        </div>

        {/* ملاحظة */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>جميع الإجراءات مسجلة ومراقبة للأمان والشفافية</p>
        </div>
      </div>
    </div>
  );
}
