// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true, // Dit zorgt dat Tailwind classes Tabler overrulen
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './projecten/**/*.{js,ts,jsx,tsx,mdx}',
    './layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    // Voeg deze toe voor extra dekking
    './node_modules/@tabler/core/dist/**/*.js',
  ],
  corePlugins: {
    preflight: true, // Dit reset styles
  },
  theme: {
    extend: {
      colors: {
        // Jouw primaire kleuren - deze overschrijven Tabler
        primary: {
          DEFAULT: '#206bc4',
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc4fa',
          400: '#36a3f7',
          500: '#0c87eb',
          600: '#206bc4', // Jouw hoofdkleur
          700: '#1d5fb4',
          800: '#1a53a4',
          900: '#174794',
        },
        // Overschrijf Tabler's gray met jouw schema
        gray: {
          50: '#f9fafb',
          100: '#f8f9fa', // Tabler's bg-secondary
          200: '#e9ecef', // Tabler's border
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#6c757d', // Tabler's text-muted
          700: '#495057',
          800: '#343a40', // Tabler's text-dark
          900: '#212529',
        },
        // Tabler overrides via Tailwind
        blue: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#206bc4', // Overschrijf Tabler blue
          600: '#1d5fb4',
          700: '#1a53a4',
        },
        red: {
          500: '#d63939', // Overschrijf Tabler red
        },
        green: {
          500: '#2fb344', // Overschrijf Tabler green
        },
        yellow: {
          500: '#f59f0b', // Overschrijf Tabler yellow
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      // Tabler component overrides
      borderRadius: {
        'tabler': '0.375rem',
        'tabler-lg': '0.5rem',
        'tabler-xl': '0.75rem',
      },
      boxShadow: {
        'tabler': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'tabler-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'tabler-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      // Tabler spacing overrides
      spacing: {
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
      },
    },
  },
  plugins: [],
  // IMPORTANT: Zorg dat Tailwind alle Tabler classes overschrijft
  safelist: [
    // Forceer Tailwind styles voor Tabler components
    'bg-primary-600',
    'text-primary-600',
    'border-primary-600',
    'bg-gray-100',
    'bg-gray-200',
    'text-gray-600',
    'text-gray-800',
    'border-gray-300',
    // Tabler component overrides
    'rounded-tabler',
    'shadow-tabler',
    'p-4',
    'p-6',
    'm-4',
    'm-6',
  ],
}
