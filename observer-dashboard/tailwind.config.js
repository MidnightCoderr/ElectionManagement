/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#F8FAFC',
          900: '#F1F5F9',
          850: '#E8EDF3',
          800: '#FFFFFF',
          750: '#F8FAFC',
          700: '#F1F5F9',
          600: '#E2E8F0',
          500: '#CBD5E1',
        },
        accent: {
          purple: '#4F46E5',
          blue: '#1B3B6F',
          green: '#15803D',
          red: '#B91C1C',
          orange: '#D97706',
          yellow: '#C9A227',
          cyan: '#0B1F3A',
        },
        muted: '#94A3B8',
      },
      fontFamily: {
        sans: ['Baloo 2', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
    }
  },
  plugins: []
}
