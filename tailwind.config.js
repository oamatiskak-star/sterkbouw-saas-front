/** @type {import('tailwindcss').Config} */
module.exports = {
  // ❌ NOOIT important bij Tabler
  important: false,

  // ✅ Alleen scopen binnen .tw (toevoeglaag)
  // Hierdoor wint Tabler altijd
  corePlugins: {
    preflight: false, // ❗ VERPLICHT
  },

  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './layouts/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],

  darkMode: 'class',

  theme: {
    extend: {
      colors: {
        sterkbouw: {
          blue: '#206bc4',
          success: '#2fb344',
          warning: '#f59f0b',
          danger: '#d63939',
        },
        sterkcalc: {
          navy: '#0D1B2A',
          navy2: '#13263b',
          blue: '#1565C0',
          accent: '#00B67A',
          warning: '#FF9F1C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },

  plugins: [],
}
