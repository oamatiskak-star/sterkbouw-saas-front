// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './projecten/**/*.{js,ts,jsx,tsx,mdx}',
    './layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  corePlugins: {
    preflight: true,
  },
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#206bc4',
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#206bc4',
          600: '#1d5fb4',
          700: '#1a53a4',
        },
        gray: {
          100: '#f8f9fa',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#6c757d',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      boxShadow: {
        'tabler': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'tabler-md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
}
