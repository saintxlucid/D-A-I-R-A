/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D7490', // Nile Blue
          50: '#E6F4F7',
          100: '#CCE9EF',
          200: '#99D3DF',
          300: '#66BDCF',
          400: '#33A7BF',
          500: '#0D7490',
          600: '#0A5D73',
          700: '#084656',
          800: '#052E39',
          900: '#03171C',
        },
        sandstone: {
          DEFAULT: '#E8D5B7',
          50: '#FAF8F4',
          100: '#F5F0E9',
          200: '#E8D5B7',
          300: '#DCBA85',
          400: '#D0A053',
          500: '#B8823B',
          600: '#96692F',
          700: '#745023',
          800: '#523717',
          900: '#301E0B',
        },
        basalt: {
          DEFAULT: '#2C3E50',
          50: '#E8EAED',
          100: '#D1D5DB',
          200: '#A3ABB7',
          300: '#758193',
          400: '#47576F',
          500: '#2C3E50',
          600: '#233240',
          700: '#1A2530',
          800: '#121920',
          900: '#090C10',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
