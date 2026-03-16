/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'dash-bg':      '#0d1117',
        'dash-surface': '#161b22',
        'dash-border':  '#30363d',
        saffron:        '#FF6B00',
        'india-green':  '#138808',
        'india-blue':   '#1a3a6b',
      },
      fontFamily: {
        baloo: ['"Baloo 2"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
