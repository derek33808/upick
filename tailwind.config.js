/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f0',
          100: '#dcefdc',
          200: '#bde0be',
          300: '#91cb93',
          400: '#48b04a',
          500: '#48b04a',
          600: '#3a9d3c',
          700: '#317d32',
          800: '#2b632c',
          900: '#255225',
        },
        accent: {
          yellow: '#FFD700',
          gray: '#F5F5F5',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'HarmonyOS Sans', 'system-ui', 'sans-serif'],
        'chinese': ['HarmonyOS Sans', 'Source Han Sans', 'Noto Sans CJK SC', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}