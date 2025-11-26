
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode using a class
  theme: {
    extend: {
      colors: {
        // Dicoding brand colors
        primary: {
          DEFAULT: '#00C4CC', // Dicoding cyan/teal
          50: '#E0F9FA',
          100: '#B3F0F3',
          200: '#80E7EB',
          300: '#4DDDE3',
          400: '#26D4DC',
          500: '#00C4CC', // Main brand color
          600: '#00B0B8',
          700: '#009AA1',
          800: '#00848A',
          900: '#006266',
        },
        secondary: {
          DEFAULT: '#0A2540', // Dark blue
          50: '#E7EBF0',
          100: '#C2CCD9',
          200: '#9AADC3',
          300: '#718EAD',
          400: '#4E6F97',
          500: '#2C5080',
          600: '#0A2540', // Main secondary
          700: '#081E34',
          800: '#061728',
          900: '#04101C',
        },
      },
      animation: {
        'pulse': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        }
      }
    },
  },
  plugins: [],
}
