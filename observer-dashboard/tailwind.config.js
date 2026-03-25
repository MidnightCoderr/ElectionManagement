/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#FAF9FF',
          900: '#F5F3FF',
          850: '#EDE9FE',
          800: '#FFFFFF',
          750: '#FAF9FF',
          700: '#F5F3FF',
          600: '#EDE9FE',
          500: '#D4CEEC',
        },
        accent: {
          purple: '#735DFF',
          blue: '#2D1B69',
          green: '#22C55E',
          red: '#FF4B6C',
          orange: '#F59E0B',
          yellow: '#FFD522',
          cyan: '#1D1136',
          magenta: '#C516E1',
          coral: '#FF4B6C',
        },
        muted: '#9F97C0',
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
    }
  },
  plugins: []
}
