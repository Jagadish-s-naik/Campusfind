/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1E5F4A',
          accent: '#2C8C63',
          deep: '#16332B',
          mid: '#2E5248',
          tint: '#DCEEE5',
        },
        surface: {
          canvas: '#F3F1EA',
          card: '#FFFFFF',
          cool: '#F8F8F8',
        },
        status: {
          error: '#C4291F',
          warning: '#E0A61B',
          success: '#2C8C63',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Manrope', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        pill: '50px',
        card: '12px',
      },
      boxShadow: {
        whisper: '0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24)',
        fab: '0 0 6px rgba(0,0,0,0.24), 0 8px 12px rgba(0,0,0,0.14)',
      }
    },
  },
  plugins: [],
}
