/**
 * نظام التصميم الفاخر لمهووس برو
 * الألوان الأساسية: أسود داكن + ذهبي فاخر
 */

export const theme = {
  colors: {
    // الخلفيات
    background: {
      primary: '#000000',      // أسود نقي
      secondary: '#1A1A1A',    // أسود داكن
      card: '#252525',         // رمادي داكن جداً
      hover: '#2A2A2A',        // رمادي داكن للـ hover
    },
    
    // الذهبي الفاخر
    gold: {
      primary: '#D4AF37',      // ذهبي رئيسي
      light: '#E5C158',        // ذهبي فاتح
      dark: '#B8941F',         // ذهبي داكن
      muted: 'rgba(212, 175, 55, 0.1)', // ذهبي شفاف
    },
    
    // النصوص
    text: {
      primary: '#FFFFFF',      // أبيض للعناوين
      secondary: '#B0B0B0',    // رمادي فاتح للتفاصيل
      muted: '#707070',        // رمادي للنصوص الثانوية
      gold: '#D4AF37',         // ذهبي للنصوص المميزة
    },
    
    // الحدود
    border: {
      default: 'rgba(212, 175, 55, 0.2)',  // حدود ذهبية خافتة
      hover: 'rgba(212, 175, 55, 0.4)',    // حدود ذهبية عند hover
      focus: '#D4AF37',                     // حدود ذهبية عند focus
    },
    
    // الحالات
    status: {
      success: '#10B981',      // أخضر للنجاح
      error: '#EF4444',        // أحمر للخطأ
      warning: '#F59E0B',      // برتقالي للتحذير
      info: '#3B82F6',         // أزرق للمعلومات
      pending: '#F59E0B',      // برتقالي للمعلق
    },
  },
  
  // الظلال
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    gold: '0 4px 20px rgba(212, 175, 55, 0.3)', // ظل ذهبي
  },
  
  // الزوايا
  borderRadius: {
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
  },
  
  // المسافات
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
  },
  
  // الخطوط
  fonts: {
    body: "'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    heading: "'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  
  // أحجام الخطوط
  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    md: '1rem',       // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
  },
  
  // الانتقالات
  transitions: {
    fast: '150ms ease-in-out',
    normal: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },
};

// CSS Classes للاستخدام المباشر
export const themeClasses = {
  // البطاقات
  card: 'bg-[#252525] border border-[rgba(212,175,55,0.2)] rounded-xl',
  cardHover: 'hover:bg-[#2A2A2A] hover:border-[rgba(212,175,55,0.4)] transition-all duration-200',
  
  // الأزرار
  buttonPrimary: 'bg-[#D4AF37] text-black hover:bg-[#E5C158] active:scale-95 transition-all duration-200',
  buttonSecondary: 'bg-transparent border border-[#D4AF37] text-[#D4AF37] hover:bg-[rgba(212,175,55,0.1)] transition-all duration-200',
  buttonDanger: 'bg-[#EF4444] text-white hover:bg-[#DC2626] active:scale-95 transition-all duration-200',
  
  // النصوص
  textPrimary: 'text-white',
  textSecondary: 'text-[#B0B0B0]',
  textMuted: 'text-[#707070]',
  textGold: 'text-[#D4AF37]',
  
  // الحدود
  borderDefault: 'border-[rgba(212,175,55,0.2)]',
  borderHover: 'hover:border-[rgba(212,175,55,0.4)]',
  borderFocus: 'focus:border-[#D4AF37]',
  
  // الخلفيات
  bgPrimary: 'bg-[#000000]',
  bgSecondary: 'bg-[#1A1A1A]',
  bgCard: 'bg-[#252525]',
  bgHover: 'hover:bg-[#2A2A2A]',
};

export default theme;
