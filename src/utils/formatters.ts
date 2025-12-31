/**
 * نظام موحد لتنسيق الأرقام والعملات والتواريخ
 * جميع الأرقام بالإنجليزية
 * الألوان حسب الحالة (أخضر للمكاسب، أحمر للخسائر)
 */

/**
 * تحويل الأرقام العربية إلى إنجليزية
 */
export const toEnglishDigits = (str: string | number): string => {
  const arabicToEnglish: { [key: string]: string } = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };
  
  return String(str).replace(/[٠-٩]/g, (d) => arabicToEnglish[d] || d);
};

/**
 * تنسيق الأرقام بفواصل (إنجليزية)
 */
export const formatNumber = (num: number | string | null | undefined): string => {
  if (num === null || num === undefined || num === '') return '0';
  
  const number = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(number)) return '0';
  
  // استخدام en-US لضمان الأرقام الإنجليزية
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(number);
};

/**
 * تنسيق المبالغ المالية (إنجليزية + ر.س)
 */
export const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined || amount === '') return '0 ر.س';
  
  const number = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(number)) return '0 ر.س';
  
  return `${formatNumber(number)} ر.س`;
};

/**
 * تنسيق النسبة المئوية
 */
export const formatPercentage = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '0%';
  return `${formatNumber(value)}%`;
};

/**
 * الحصول على لون حسب القيمة (موجب/سالب)
 */
export const getValueColor = (value: number): string => {
  if (value > 0) return 'text-green-500'; // أخضر للمكاسب
  if (value < 0) return 'text-red-500'; // أحمر للخسائر
  return 'text-[#B0B0B0]'; // رمادي للصفر
};

/**
 * الحصول على لون الخلفية حسب القيمة
 */
export const getValueBgColor = (value: number): string => {
  if (value > 0) return 'bg-green-500/10 border-green-500/30'; // أخضر فاتح
  if (value < 0) return 'bg-red-500/10 border-red-500/30'; // أحمر فاتح
  return 'bg-[#252525] border-[rgba(212,175,55,0.2)]'; // الافتراضي
};

/**
 * الحصول على أيقونة حسب الحالة
 */
export const getStatusColor = (status: string): string => {
  const statusColors: { [key: string]: string } = {
    // حالات النجاح (أخضر)
    'مكتمل': 'bg-green-500',
    'مقفل': 'bg-green-500',
    'مدفوع': 'bg-green-500',
    'نشط': 'bg-green-500',
    'متوفر': 'bg-green-500',
    
    // حالات الانتظار (أصفر/ذهبي)
    'قيد المعالجة': 'bg-yellow-500',
    'معلق': 'bg-yellow-500',
    'جديد': 'bg-[#D4AF37]',
    
    // حالات الإلغاء/الخطأ (أحمر)
    'ملغي': 'bg-red-500',
    'مرفوض': 'bg-red-500',
    'فشل': 'bg-red-500',
    'غير متوفر': 'bg-red-500',
    
    // حالات أخرى (رمادي)
    'غير نشط': 'bg-gray-500',
  };
  
  return statusColors[status] || 'bg-[#B0B0B0]';
};

/**
 * الحصول على لون النص حسب الحالة
 */
export const getStatusTextColor = (status: string): string => {
  const statusColors: { [key: string]: string } = {
    // حالات النجاح (أخضر)
    'مكتمل': 'text-green-500',
    'مقفل': 'text-green-500',
    'مدفوع': 'text-green-500',
    'نشط': 'text-green-500',
    'متوفر': 'text-green-500',
    
    // حالات الانتظار (أصفر/ذهبي)
    'قيد المعالجة': 'text-yellow-500',
    'معلق': 'text-yellow-500',
    'جديد': 'text-[#D4AF37]',
    
    // حالات الإلغاء/الخطأ (أحمر)
    'ملغي': 'text-red-500',
    'مرفوض': 'text-red-500',
    'فشل': 'text-red-500',
    'غير متوفر': 'text-red-500',
    
    // حالات أخرى (رمادي)
    'غير نشط': 'text-gray-500',
  };
  
  return statusColors[status] || 'text-[#B0B0B0]';
};

/**
 * تنسيق التاريخ (إنجليزي)
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Riyadh'
  }).format(d);
};

/**
 * تنسيق التاريخ والوقت (إنجليزي)
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Riyadh'
  }).format(d);
};

/**
 * تنسيق الوقت النسبي (منذ...)
 */
export const formatRelativeTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${formatNumber(diffMins)} دقيقة`;
  if (diffHours < 24) return `منذ ${formatNumber(diffHours)} ساعة`;
  if (diffDays < 30) return `منذ ${formatNumber(diffDays)} يوم`;
  
  return formatDate(d);
};

/**
 * تنسيق رقم الهاتف
 */
export const formatPhone = (phone: string | null | undefined): string => {
  if (!phone) return '-';
  
  // تحويل إلى أرقام إنجليزية
  const englishPhone = toEnglishDigits(phone);
  
  // إزالة أي أحرف غير رقمية
  const cleaned = englishPhone.replace(/\D/g, '');
  
  // تنسيق رقم سعودي (05xxxxxxxx)
  if (cleaned.length === 10 && cleaned.startsWith('05')) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  return englishPhone;
};

/**
 * اختصار النص الطويل
 */
export const truncateText = (text: string | null | undefined, maxLength: number = 50): string => {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * تنسيق حجم الملف
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${formatNumber(parseFloat((bytes / Math.pow(k, i)).toFixed(2)))} ${sizes[i]}`;
};
