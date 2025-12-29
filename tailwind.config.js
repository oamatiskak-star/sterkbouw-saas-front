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
    './contexts/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './utils/**/*.{js,ts,jsx,tsx,mdx}',
    './public/**/*.{html,js}',
    './node_modules/@tabler/core/dist/**/*.js',
    './node_modules/@tabler/icons-react/dist/**/*.js',
  ],
  darkMode: 'class',
  corePlugins: {
    preflight: true,
  },
  theme: {
    extend: {
      colors: {
        // Sterkbouw kleurenpalet
        sterkbouw: {
          blue: '#206bc4',
          blueDark: '#1a53a4',
          blueLight: '#36a3f7',
          gray: '#f8f9fa',
          grayDark: '#343a40',
          success: '#2fb344',
          warning: '#f59f0b',
          danger: '#d63939',
        },
        primary: {
          DEFAULT: '#206bc4',
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc4fa',
          400: '#36a3f7',
          500: '#0c87eb',
          600: '#206bc4',
          700: '#1d5fb4',
          800: '#1a53a4',
          900: '#174794',
        },
        gray: {
          50: '#f9fafb',
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
        blue: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#206bc4',
          600: '#1d5fb4',
          700: '#1a53a4',
        },
        red: {
          500: '#d63939',
        },
        green: {
          500: '#2fb344',
        },
        yellow: {
          500: '#f59f0b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'xxs': '0.625rem',
        'tabler-sm': '0.75rem',
        'tabler-base': '0.875rem',
        'tabler-lg': '1rem',
      },
      borderRadius: {
        'tabler': '0.375rem',
        'tabler-lg': '0.5rem',
        'tabler-xl': '0.75rem',
        'tabler-2xl': '1rem',
      },
      boxShadow: {
        'tabler': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'tabler-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'tabler-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'tabler-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'inner-tabler': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      spacing: {
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-out': 'fadeOut 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'pulse-tabler': 'pulseTabler 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseTabler: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'toast': '1080',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'width': 'width',
        'size': 'width, height',
      },
    },
  },
  plugins: [],
  safelist: [
    // Tabler component classes
    'bg-blue',
    'bg-blue-600',
    'text-blue',
    'text-blue-600',
    'border-blue',
    'border-blue-600',
    
    // Sterkbouw specific
    'bg-sterkbouw-blue',
    'text-sterkbouw-blue',
    'border-sterkbouw-blue',
    
    // Layout utilities
    'rounded-tabler',
    'rounded-tabler-lg',
    'shadow-tabler',
    'shadow-tabler-lg',
    
    // Spacing utilities
    'p-4',
    'p-6',
    'm-4',
    'm-6',
    'px-4',
    'py-3',
    
    // Typography
    'text-tabler-base',
    'text-tabler-lg',
    
    // State classes
    'hover:bg-blue-700',
    'focus:ring-2',
    'focus:ring-blue-500',
    
    // Animation classes
    'animate-fade-in',
    'animate-slide-up',
    
    // Dark mode
    'dark:bg-gray-800',
    'dark:text-gray-100',
    'dark:border-gray-700',
  ],
}
