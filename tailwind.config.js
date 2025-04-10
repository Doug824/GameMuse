/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        twilight: '#1F2937',    // Main background (containers)
        fog: '#374151',         // Secondary background
        forest: '#4B5563',      // Borders / Lines
        moonlight: '#E5E7EB',   // Header Title / Logo
        mist: '#F9FAFB',        // Text (primary)
        gold: '#FBBF24',        // Primary Accent
        sage: '#A3B18A',        // Secondary Accent
        tan: '#D6CBB4',         // Text (secondary)
        ethereal: '#A78BFA',    // Highlight Glow (optional)
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100%',
          },
        },
      },
      backgroundImage: {
        'forest-bg': "url('/forest-bg.jpg')", // We'll add this image later
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}