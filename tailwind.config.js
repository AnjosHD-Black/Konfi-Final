/** @type {import('tailwindcss').Config} */
export default {
  // Wichtig: Hierdurch wird der Konfigurator-Code in src/App.jsx gefunden
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}