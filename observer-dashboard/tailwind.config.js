/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#f6f4ee',
          900: '#efeade',
          850: '#e5ddcd',
          800: '#FFFFFF',
          750: '#faf8f2',
          700: '#ebe4d4',
          600: '#d9cfbb',
          500: '#c9bfab',
        },
        accent: {
          purple: '#215f4e',
          blue: '#3a5f87',
          green: '#2f7d4c',
          red: '#b13f34',
          orange: '#ad7b2f',
          yellow: '#d2aa58',
          cyan: '#18483b',
          magenta: '#8b6a2e',
          coral: '#c16c4a',
        },
        muted: '#736d5e',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.625rem',
        '2xl': '0.875rem',
        '3xl': '1rem',
      },
    }
  },
  plugins: []
}
