/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f5f0ff',
          100: '#ede0ff',
          200: '#dac2ff',
          300: '#bf95ff',
          400: '#a35eff',
          500: '#8b2be2',
          600: '#7916c7',
          700: '#6410a3',
          800: '#510d84',
          900: '#3d0a63',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
