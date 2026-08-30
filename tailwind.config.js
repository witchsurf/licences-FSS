/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fss: {
          green: '#00853F',
          yellow: '#FDEF42',
          red: '#E31B23',
          blue: '#0080C8',
          darkblue: '#005a8c',
          navy: '#0c2340',
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Montserrat', 'sans-serif']
      }
    },
  },
  plugins: [],
}
