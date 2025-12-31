/**
 * دوال مساعدة للتنسيق - الأرقام والوقت
 */

/**
 * تحويل الأرقام العربية إلى إنجليزية
 */
export const toEnglishNumbers = (str: string | number): string => {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let result = String(str);
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(arabicNumbers[i], 'g'), englishNumbers[i]);
  }
  return result;
};

/**
 * تنسيق الأرقام بالفواصل (1,234.56)
 */
export const formatNumber = (num: number | string, decimals: number = 2): string => {
  const number = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(number)) return '0';
  
  return number.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * تنسيق المبالغ المالية
 */
export const formatCurrency = (amount: number | string, currency: string = 'ر.س'): string => {
  const formatted = formatNumber(amount, 2);
  return `${formatted} ${currency}`;
};

/**
 * حساب الوقت النسبي (منذ ساعة، منذ يوم)
 */
export const getRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (seconds < 60) return 'الآن';
  if (minutes < 60) return `منذ ${toEnglishNumbers(minutes)} ${minutes === 1 ? 'دقيقة' : 'دقائق'}`;
  if (hours < 24) return `منذ ${toEnglishNumbers(hours)} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
  if (days < 7) return `منذ ${toEnglishNumbers(days)} ${days === 1 ? 'يوم' : 'أيام'}`;
  if (weeks < 4) return `منذ ${toEnglishNumbers(weeks)} ${weeks === 1 ? 'أسبوع' : 'أسابيع'}`;
  if (months < 12) return `منذ ${toEnglishNumbers(months)} ${months === 1 ? 'شهر' : 'أشهر'}`;
  return `منذ ${toEnglishNumbers(years)} ${years === 1 ? 'سنة' : 'سنوات'}`;
};

/**
 * تنسيق التاريخ والوقت الكامل
 */
export const formatDateTime = (date: string | Date, includeTime: boolean = true): string => {
  const d = new Date(date);
  
  const year = toEnglishNumbers(d.getFullYear());
  const month = toEnglishNumbers(String(d.getMonth() + 1).padStart(2, '0'));
  const day = toEnglishNumbers(String(d.getDate()).padStart(2, '0'));
  
  if (!includeTime) {
    return `${year}-${month}-${day}`;
  }
  
  const hours = toEnglishNumbers(String(d.getHours()).padStart(2, '0'));
  const minutes = toEnglishNumbers(String(d.getMinutes()).padStart(2, '0'));
  const seconds = toEnglishNumbers(String(d.getSeconds()).padStart(2, '0'));
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * تنسيق التاريخ بصيغة عربية
 */
export const formatDateArabic = (date: string | Date): string => {
  const d = new Date(date);
  
  const day = toEnglishNumbers(d.getDate());
  const month = toEnglishNumbers(d.getMonth() + 1);
  const year = toEnglishNumbers(d.getFullYear());
  
  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  
  return `${day} ${monthNames[d.getMonth()]} ${year}`;
};

/**
 * تنسيق الوقت فقط
 */
export const formatTime = (date: string | Date): string => {
  const d = new Date(date);
  
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 يصبح 12
  
  return `${toEnglishNumbers(hours)}:${toEnglishNumbers(minutes)} ${ampm}`;
};

/**
 * تنسيق التاريخ والوقت مع الوقت النسبي
 */
export const formatDateTimeWithRelative = (date: string | Date): string => {
  const relativeTime = getRelativeTime(date);
  const fullDateTime = formatDateTime(date);
  
  return `${relativeTime} (${fullDateTime})`;
};

/**
 * تنسيق الوقت النسبي القصير
 */
export const getShortRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return 'الآن';
  if (minutes < 60) return `${toEnglishNumbers(minutes)}د`;
  if (hours < 24) return `${toEnglishNumbers(hours)}س`;
  if (days < 7) return `${toEnglishNumbers(days)}ي`;
  if (days < 30) return `${toEnglishNumbers(Math.floor(days / 7))}أ`;
  if (days < 365) return `${toEnglishNumbers(Math.floor(days / 30))}ش`;
  return `${toEnglishNumbers(Math.floor(days / 365))}سن`;
};

/**
 * تحويل رقم الهاتف إلى صيغة قابلة للقراءة
 */
export const formatPhoneNumber = (phone: string): string => {
  // إزالة جميع الأحرف غير الرقمية
  const cleaned = phone.replace(/\D/g, '');
  
  // تحويل إلى أرقام إنجليزية
  const english = toEnglishNumbers(cleaned);
  
  // تنسيق: +966 50 123 4567
  if (english.startsWith('966')) {
    return `+${english.slice(0, 3)} ${english.slice(3, 5)} ${english.slice(5, 8)} ${english.slice(8)}`;
  }
  
  // تنسيق: 050 123 4567
  if (english.startsWith('0')) {
    return `${english.slice(0, 3)} ${english.slice(3, 6)} ${english.slice(6)}`;
  }
  
  return english;
};

/**
 * تنسيق النسبة المئوية
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${toEnglishNumbers(value.toFixed(decimals))}%`;
};

/**
 * تنسيق حجم الملف
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${toEnglishNumbers((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * التحقق من صحة التاريخ
 */
export const isValidDate = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * الحصول على بداية اليوم
 */
export const getStartOfDay = (date: Date = new Date()): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * الحصول على نهاية اليوم
 */
export const getEndOfDay = (date: Date = new Date()): Date => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * الحصول على بداية الشهر
 */
export const getStartOfMonth = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * الحصول على نهاية الشهر
 */
export const getEndOfMonth = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
};
