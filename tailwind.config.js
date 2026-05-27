/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        // MimiBon brand palette
        brand: {
          50:  "#fff2fa",  // lightest pink bg
          100: "#fed9ea",  // pale pink
          200: "#fde7f1",
          300: "#f3b2d4",
          400: "#f97fb5",
          500: "#d6006d",  // PRIMARY brand
          600: "#b9005f",  // darker
          700: "#942d5c",  // burgundy
          800: "#7a1a48",
          900: "#5c1234",
        },
        accent: {
          50:  "#fff5ec",
          100: "#ffe4cf",
          300: "#ffc493",
          500: "#f88d2a",  // accent orange
          700: "#c66a17",
        }
      }
    }
  },
  plugins: []
};
