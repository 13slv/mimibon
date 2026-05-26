/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eff6fb",
          100: "#dceaf5",
          500: "#2E75B6",
          600: "#1F4E78",
          700: "#173a5a",
        }
      }
    }
  },
  plugins: []
};
