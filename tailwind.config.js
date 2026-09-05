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
        bi: {
          bg: '#0A1628',
          card: '#0F2038',
          border: 'rgba(255, 255, 255, 0.08)',
          accent: '#10B981',
          gold: '#F59E0B',
        },
      },
    },
  },
  plugins: [],
}
