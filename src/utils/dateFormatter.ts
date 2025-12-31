/**
 * نظام موحد لتنسيق التاريخ والوقت
 * يستخدم Intl.DateTimeFormat للتوافق مع المعايير السعودية
 */

// تنسيق التاريخ والوقت الكامل
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

// تنسيق التاريخ فقط
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

// تنسيق الوقت فقط
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

// تنسيق الوقت النسبي (منذ...)
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  // أقل من دقيقة
  if (diffInSeconds < 60) {
    return 'الآن';
  }

  // أقل من ساعة
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `منذ ${minutes} ${minutes === 1 ? 'دقيقة' : minutes === 2 ? 'دقيقتين' : 'دقائق'}`;
  }

  // أقل من يوم
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `منذ ${hours} ${hours === 1 ? 'ساعة' : hours === 2 ? 'ساعتين' : 'ساعات'}`;
  }

  // أقل من أسبوع
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `منذ ${days} ${days === 1 ? 'يوم' : days === 2 ? 'يومين' : 'أيام'}`;
  }

  // أقل من شهر
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `منذ ${weeks} ${weeks === 1 ? 'أسبوع' : weeks === 2 ? 'أسبوعين' : 'أسابيع'}`;
  }

  // أقل من سنة
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `منذ ${months} ${months === 1 ? 'شهر' : months === 2 ? 'شهرين' : 'أشهر'}`;
  }

  // أكثر من سنة
  const years = Math.floor(diffInSeconds / 31536000);
  return `منذ ${years} ${years === 1 ? 'سنة' : years === 2 ? 'سنتين' : 'سنوات'}`;
}

// تنسيق مدمج: وقت نسبي + تاريخ كامل عند التمرير
export function formatSmartDate(date: string | Date): {
  display: string;
  tooltip: string;
} {
  return {
    display: formatRelativeTime(date),
    tooltip: formatDateTime(date),
  };
}

// تنسيق للجداول (مختصر)
export function formatTableDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - d.getTime()) / 86400000);

  // اليوم
  if (diffInDays === 0) {
    return `اليوم ${formatTime(d)}`;
  }

  // أمس
  if (diffInDays === 1) {
    return `أمس ${formatTime(d)}`;
  }

  // خلال الأسبوع الماضي
  if (diffInDays < 7) {
    return `منذ ${diffInDays} ${diffInDays === 2 ? 'يومين' : 'أيام'}`;
  }

  // أكثر من أسبوع
  return formatDate(d);
}
