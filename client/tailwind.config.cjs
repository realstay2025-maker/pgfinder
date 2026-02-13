// client/tailwind.config.js
// Centralized Blue Professional Theme
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary indigo palette (modern premium theme)
        'primary': {
          50: '#f3f0ff',
          100: '#e9e5ff',
          200: '#d8d0ff',
          300: '#c4b5ff',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4f46e5',
        },
        // Secondary violet for accents
        'secondary': {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        // Legacy colors mapped to new theme
        'primary-dark': '#4f46e5',
        'accent-green': '#10b981',
        'custom-red': '#ef4444',
      },
      backgroundImage: {
        'gradient-navbar': 'linear-gradient(to right, #1e40af, #1e3a8a)',
        'gradient-sidebar': 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)',
        'gradient-card': 'linear-gradient(135deg, #f0f9ff 0%, #eff6ff 100%)',
        'gradient-button': 'linear-gradient(to right, #1d4ed8, #1e40af)',
      },
      screens: {
        'xs': '475px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}