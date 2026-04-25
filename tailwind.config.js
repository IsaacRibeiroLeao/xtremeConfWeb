/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        xtreme: {
          red: '#E63928',
          yellow: '#F9D648',
          orange: '#F28C28',
          blue: '#2E3A8C',
          black: '#1A0A0A',
          cream: '#F1E4C1',
        }
      }
    },
  },
  plugins: [],
}
