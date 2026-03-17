/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        saffron:      '#C9A227',
        'saffron-lt': '#D4AF37',
        'india-green':'#15803D',
        'india-blue': '#0B1F3A',
      },
      fontFamily: {
        baloo: ['"Baloo 2"', 'sans-serif'],
      },
      minHeight: { touch: '80px' },
      minWidth:  { touch: '80px' },
    },
  },
  plugins: [],
}
