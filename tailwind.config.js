/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // الهوية الجديدة (أسود وذهبي)
        black: '#000000',
        dark: '#1A1A1A',
        darker: '#252525',
        gold: {
          DEFAULT: '#D4AF37',
          light: '#E5C158',
          dark: '#B8941F',
        },
        // تجاوز الألوان الافتراضية
        blue: {
          50: '#1A1A1A',
          100: '#252525',
          200: '#D4AF37',
          300: '#D4AF37',
          400: '#D4AF37',
          500: '#D4AF37',
          600: '#D4AF37',
          700: '#B8941F',
          800: '#B8941F',
          900: '#B8941F',
        },
        indigo: {
          50: '#1A1A1A',
          100: '#252525',
          200: '#D4AF37',
          300: '#D4AF37',
          400: '#D4AF37',
          500: '#D4AF37',
          600: '#D4AF37',
          700: '#B8941F',
          800: '#B8941F',
          900: '#B8941F',
        },
        gray: {
          50: '#252525',
          100: '#1A1A1A',
          200: '#252525',
          300: '#333333',
          400: '#999999',
          500: '#CCCCCC',
          600: '#CCCCCC',
          700: '#FFFFFF',
          800: '#FFFFFF',
          900: '#FFFFFF',
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float-delayed 8s ease-in-out infinite',
        'loading-bar': 'loading-bar 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'slideInUp': 'slideInUp 0.6s ease-out',
        'fadeIn': 'fadeIn 0.8s ease-out',
        'scaleIn': 'scaleIn 0.5s ease-out',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(212, 175, 55, 0.37)',
        'glow': '0 0 20px rgba(212, 175, 55, 0.5)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
