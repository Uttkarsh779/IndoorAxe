/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#111111',
          accent: '#c9a227',
        },
      },
    },
  },
  plugins: [],
};
