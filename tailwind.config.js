/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100%',
          },
        },
      },
      colors: {
        'fae': {
          DEFAULT: '#9932cc',
          'dark': '#6a0dad',
          'light': '#b19cd9',
        },
        'sage': {
          'dark': '#2f4f4f',
          'medium': '#1f2937',
          'light': '#4b5563',
        },
        'autumn': {
          'gold': '#d4af37',
          'red': '#8b0000',
        },
      },
      screens: {
        'xs': '480px',
      },
      scale: {
        '98': '.98',
        '102': '1.02',
      },
      spacing: {
        '18': '4.5rem',
      },
      boxShadow: {
        'fantasy': '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 15px rgba(204, 50, 83, 0.2)',
        'fantasy-hover': '0 8px 25px rgba(0, 0, 0, 0.4), 0 0 20px rgba(153, 50, 204, 0.5)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}