/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
  ],
  theme: {
    extend: {
      colors: {
        'n4z-green': '#2CB34A',
        'n4z-green-dark': '#17692A',
        'n4z-blue':  '#132A3A', // dawny błękit zmapowany na granat brand kitu
        'n4z-cream': '#F0E5D8',
        'n4z-dark':  '#132A3A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
