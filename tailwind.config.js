/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          50: '#f4f7f6',
          100: '#e3eae7',
          200: '#c7d6d1',
          300: '#a1bbb3',
          400: '#769b91',
          500: '#587f75',
          600: '#43655d',
          700: '#38524d',
          800: '#304440',
          900: '#2b3a37',
          950: '#0b0f19',
        },
        brand: {
          amber: '#f59e0b',
          amberHover: '#d97706',
          emerald: '#10b981',
          rose: '#f43f5e',
          indigo: '#6366f1',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        heading: ['Cabinet Grotesk', 'Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glass: '0 12px 32px 0 rgba(0, 0, 0, 0.37)',
        glow: '0 0 25px -2px rgba(245, 158, 11, 0.35)',
        glowEmerald: '0 0 25px -2px rgba(16, 185, 129, 0.35)',
      }
    },
  },
  plugins: [],
}
