/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { night: '#241F33', paper: '#F6EEDC', amber: '#F2B84B', ink: '#2B2438' },
      fontFamily: { sans: ['Vazirmatn', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'] },
    },
  },
  plugins: [],
};
