/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eef4ff',
          100: '#dce7fe',
          200: '#b9cffd',
          300: '#8faffa',
          400: '#6690f6',
          500: '#3d6ef0',
          600: '#2450e3',
          700: '#1d3fc0',
          800: '#1a359b',
          900: '#182f7c',
          DEFAULT: '#2450e3',
        },
        ink: {
          50:  '#f4f6fb',
          100: '#e8ecf4',
          200: '#d5dbe8',
          300: '#aeb9cf',
          400: '#8291b0',
          500: '#5f6f92',
          600: '#475677',
          700: '#333f63',
          800: '#1e2740',
          900: '#141b30',
          950: '#0b1220',
          DEFAULT: '#0b1220',
        },
        accent: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          DEFAULT: '#f59e0b',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,.05), 0 8px 24px -8px rgba(16,24,40,.10)',
        'card-lg': '0 2px 4px rgba(16,24,40,.05), 0 20px 48px -16px rgba(16,24,40,.18)',
        glow: '0 8px 30px -6px rgba(36,80,227,.45)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up .45s cubic-bezier(.16,1,.3,1) both',
        'fade-in': 'fade-in .3s ease both',
        'slide-in-right': 'slide-in-right .35s cubic-bezier(.16,1,.3,1) both',
        shimmer: 'shimmer 1.4s linear infinite',
      },
    },
  },
  plugins: [],
}
