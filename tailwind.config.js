/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2D62FF', // Brand primary from colors.json
          dark: '#1E4ED8',
          light: '#4F7FFF',
          50: '#E8F0FF',
          100: '#C8DBFF',
          200: '#A5C4FF',
          300: '#81ADFF',
          400: '#4F7FFF',
          500: '#2D62FF',
          600: '#1E4ED8',
          700: '#1638B3',
          800: '#0F2588',
          900: '#0A165D',
        },
        secondary: {
          DEFAULT: '#2DD4BF', // Brand secondary from colors.json
          dark: '#1FA896',
          light: '#4FE0CD',
        },
        brand: {
          primary: '#2D62FF',
          secondary: '#2DD4BF',
          background: '#F8FAFC',
          text: '#1E293B',
          accent: '#2E7D32',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 3s infinite',
      },
    },
  },
  plugins: [],
}

