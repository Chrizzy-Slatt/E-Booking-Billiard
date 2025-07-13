/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'playfair': ['Playfair', 'serif'],
        'outfit': ['Outfit', 'sans-serif'],
      },
      colors: {
        primary: '#2563eb',
        secondary: '#fbbf24',
      },
      spacing: {
        '130': '32.5rem',
        '65': '16.25rem',
        '6.5': '1.625rem',
      }
    },
  },
  plugins: [],
}
