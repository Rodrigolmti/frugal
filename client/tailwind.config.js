/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Notion-inspired color palette
        notion: {
          // Neutral grays (primary palette)
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
          // Subtle accent colors
          blue: '#2383e2',
          'blue-light': '#e8f3ff',
          green: '#0f7b0f',
          'green-light': '#e8f5e8',
          red: '#e03e3e',
          'red-light': '#ffeaea',
          yellow: '#f59e0b',
          'yellow-light': '#fef3c7',
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
      },
      spacing: {
        'notion-xs': '4px',
        'notion-sm': '8px',
        'notion-md': '12px',
        'notion-lg': '16px',
        'notion-xl': '24px',
        'notion-2xl': '32px',
        'notion-3xl': '48px',
      },
      borderRadius: {
        'notion': '6px',
        'notion-lg': '8px',
      },
      boxShadow: {
        'notion': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'notion-md': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'notion-hover': '0 2px 16px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}
