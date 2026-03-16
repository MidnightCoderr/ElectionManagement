/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        saffron:      '#FF6B00',
        'saffron-lt': '#FF9A3C',
        'india-green':'#138808',
        'india-blue': '#1a3a6b',
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
