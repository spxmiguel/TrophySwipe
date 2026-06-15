import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#070a12',
          900: '#0c111c',
          850: '#111827',
          800: '#172033',
        },
        signal: {
          cyan: '#23d3ee',
          blue: '#5a8cff',
          amber: '#f5b44d',
          green: '#42d392',
          red: '#ff5d73',
        },
      },
      boxShadow: {
        glow: '0 0 40px rgba(35, 211, 238, 0.18)',
        panel: '0 20px 60px rgba(0, 0, 0, 0.28)',
      },
    },
  },
  plugins: [],
} satisfies Config
