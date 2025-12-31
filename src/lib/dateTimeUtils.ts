/**
 * نظام التاريخ والوقت الاحترافي
 * Time & Date Utilities - Mahwous Professional System
 */

// المنطقة الزمنية الافتراضية (يمكن تغييرها من إعدادات الشركة)
const COMPANY_TIMEZONE = 'Asia/Riyadh'; // GMT+3

/**
 * تحويل UTC إلى المنطقة الزمنية للشركة
 */
const toCompanyTimezone = (utcDate: Date): Date => {
  // تحويل التاريخ إلى المنطقة الزمنية المحددة
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: COMPANY_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  
  const parts = formatter.formatToParts(utcDate);
  const values: any = {};
  parts.forEach(({ type, value }) => {
    values[type] = value;
  });
  
  return new Date(
    `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}`
  );
};

/**
 * تنسيق للفواتير والسجلات المحاسبية
 * Format: DD/MM/YYYY - hh:mm A
 * Color: White (#FFFFFF)
 */
export const formatInvoiceDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const localDate = toCompanyTimezone(d);
  
  const day = String(localDate.getDate()).padStart(2, '0');
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const year = localDate.getFullYear();
  
  let hours = localDate.getHours();
  const minutes = String(localDate.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursStr = String(hours).padStart(2, '0');
  
  return `${day}/${month}/${year} - ${hoursStr}:${minutes} ${ampm}`;
};

/**
 * تنسيق للإشعارات والسجلات (نسبي إذا < 24 ساعة)
 * Format: Relative (ago) if < 24h
 * Color: Grey (#AAAAAA)
 */
export const formatNotificationDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  // إذا كان أقل من 24 ساعة، استخدم التنسيق النسبي
  if (diffHours < 24) {
    return formatRelativeTime(d);
  }
  
  // إذا كان أكثر من 24 ساعة، استخدم التنسيق المطلق
  return formatInvoiceDateTime(d);
};

/**
 * تنسيق الوقت النسبي (منذ...)
 */
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (seconds < 60) {
    return 'الآن';
  }
  
  if (minutes < 60) {
    return `منذ ${minutes} ${minutes === 1 ? 'دقيقة' : minutes === 2 ? 'دقيقتين' : 'دقائق'}`;
  }
  
  if (hours < 24) {
    return `منذ ${hours} ${hours === 1 ? 'ساعة' : hours === 2 ? 'ساعتين' : 'ساعات'}`;
  }
  
  return formatInvoiceDateTime(date);
};

/**
 * تنسيق التاريخ فقط (بدون وقت)
 * Format: DD/MM/YYYY
 */
export const formatDateOnly = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const localDate = toCompanyTimezone(d);
  
  const day = String(localDate.getDate()).padStart(2, '0');
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const year = localDate.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * تنسيق الوقت فقط (بدون تاريخ)
 * Format: hh:mm A
 */
export const formatTimeOnly = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const localDate = toCompanyTimezone(d);
  
  let hours = localDate.getHours();
  const minutes = String(localDate.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursStr = String(hours).padStart(2, '0');
  
  return `${hoursStr}:${minutes} ${ampm}`;
};

/**
 * تحويل من المنطقة الزمنية المحلية إلى UTC للتخزين
 */
export const toUTC = (localDate: Date): Date => {
  return new Date(localDate.toISOString());
};

/**
 * تحويل من UTC إلى المنطقة الزمنية المحلية
 */
export const fromUTC = (utcDate: string | Date): Date => {
  const d = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  return toCompanyTimezone(d);
};

/**
 * الحصول على التاريخ والوقت الحالي بالمنطقة الزمنية للشركة
 */
export const getCurrentDateTime = (): Date => {
  return toCompanyTimezone(new Date());
};

/**
 * تنسيق للتصدير (Excel, PDF)
 * Format: YYYY-MM-DD HH:mm:ss
 */
export const formatForExport = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const localDate = toCompanyTimezone(d);
  
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  const hours = String(localDate.getHours()).padStart(2, '0');
  const minutes = String(localDate.getMinutes()).padStart(2, '0');
  const seconds = String(localDate.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * التحقق من صحة التاريخ
 */
export const isValidDate = (date: any): boolean => {
  if (!date) return false;
  const d = date instanceof Date ? date : new Date(date);
  return !isNaN(d.getTime());
};

/**
 * الحصول على بداية اليوم
 */
export const getStartOfDay = (date?: Date): Date => {
  const d = date ? new Date(date) : getCurrentDateTime();
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * الحصول على نهاية اليوم
 */
export const getEndOfDay = (date?: Date): Date => {
  const d = date ? new Date(date) : getCurrentDateTime();
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * الحصول على بداية الشهر
 */
export const getStartOfMonth = (date?: Date): Date => {
  const d = date ? new Date(date) : getCurrentDateTime();
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
};

/**
 * الحصول على نهاية الشهر
 */
export const getEndOfMonth = (date?: Date): Date => {
  const d = date ? new Date(date) : getCurrentDateTime();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
};

/**
 * الحصول على بداية السنة
 */
export const getStartOfYear = (date?: Date): Date => {
  const d = date ? new Date(date) : getCurrentDateTime();
  return new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0);
};

/**
 * الحصول على نهاية السنة
 */
export const getEndOfYear = (date?: Date): Date => {
  const d = date ? new Date(date) : getCurrentDateTime();
  return new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
};

/**
 * حساب الفرق بين تاريخين (بالأيام)
 */
export const getDaysDifference = (date1: Date, date2: Date): number => {
  const diffMs = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * إضافة أيام إلى تاريخ
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * إضافة أشهر إلى تاريخ
 */
export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

/**
 * تنسيق اسم الشهر بالعربية
 */
export const getArabicMonthName = (monthIndex: number): string => {
  const months = [
    'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  return months[monthIndex];
};

/**
 * تنسيق اسم اليوم بالعربية
 */
export const getArabicDayName = (dayIndex: number): string => {
  const days = [
    'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
  ];
  return days[dayIndex];
};
