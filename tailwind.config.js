/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
  ],
  theme: {
    extend: {
      colors: {
        'n4z-green': '#4CAF50',
        'n4z-blue':  '#03A9F4',
        'n4z-cream': '#F0E5D8',
        'n4z-dark':  '#0F172A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
