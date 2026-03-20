/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        notion: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          blue: '#2383e2',
          'blue-light': '#e8f3ff',
          'blue-dark': '#1a6bc4',
          green: '#0f7b0f',
          'green-light': '#e8f5e8',
          red: '#e03e3e',
          'red-light': '#ffeaea',
          yellow: '#f59e0b',
          'yellow-light': '#fef3c7',
          orange: '#e8590c',
        }
      },
      fontFamily: {
        'notion': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica', 'Apple Color Emoji', 'Arial', 'sans-serif', 'Segoe UI Emoji', 'Segoe UI Symbol'],
      },
      fontSize: {
        'notion-xs': ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
        'notion-sm': ['14px', { lineHeight: '20px', letterSpacing: '0.01em' }],
        'notion-base': ['16px', { lineHeight: '24px', letterSpacing: '0.01em' }],
        'notion-lg': ['18px', { lineHeight: '28px', letterSpacing: '0.01em' }],
        'notion-xl': ['20px', { lineHeight: '30px', letterSpacing: '0.01em' }],
        'notion-2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em' }],
        'notion-3xl': ['30px', { lineHeight: '36px', letterSpacing: '-0.02em' }],
        'notion-4xl': ['36px', { lineHeight: '40px', letterSpacing: '-0.02em' }],
        'notion-5xl': ['48px', { lineHeight: '52px', letterSpacing: '-0.03em' }],
      },
      spacing: {
        'notion-xs': '4px',
        'notion-sm': '8px',
        'notion-md': '12px',
        'notion-lg': '16px',
        'notion-xl': '24px',
        'notion-2xl': '32px',
        'notion-3xl': '48px',
        'notion-4xl': '64px',
      },
      borderRadius: {
        'notion': '6px',
        'notion-lg': '8px',
        'notion-xl': '12px',
        'notion-2xl': '16px',
      },
      boxShadow: {
        'notion': '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'notion-md': '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
        'notion-lg': '0 8px 24px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.04)',
        'notion-hover': '0 8px 30px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.04)',
        'notion-float': '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.6' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
