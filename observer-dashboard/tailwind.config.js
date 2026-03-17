/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#08080f',
          900: '#0e0e1a',
          850: '#121220',
          800: '#161628',
          750: '#1a1a30',
          700: '#1e1e38',
          600: '#2a2a45',
          500: '#3a3a55',
        },
        accent: {
          purple: '#7c5cfc',
          blue: '#4e8eff',
          green: '#34d399',
          red: '#f87171',
          orange: '#fb923c',
          yellow: '#fbbf24',
          cyan: '#22d3ee',
        },
        muted: '#6b6b8a',
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
