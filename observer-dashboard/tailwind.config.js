/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts}'],
  theme: {
    extend: {
      colors: {
        'dash-bg': '#0d1117',
        'dash-surface': '#161b22',
        'dash-border': '#30363d',
        'dash-text': '#e6edf3',
        'dash-muted': '#8b949e',
      }
    }
  },
  plugins: []
}
