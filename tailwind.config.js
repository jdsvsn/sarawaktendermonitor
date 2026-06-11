/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sarawak: {
          red: '#e61e25',
          yellow: '#ffcc00',
          black: '#000000',
        },
        nature: {
          green: '#059669',
        },
        navy: {
          950: '#04091a',
          900: '#070f2b',
          800: '#0a1628',
          700: '#0d1f3c',
          600: '#112848',
        },
        gold: {
          400: '#f5c842',
          500: '#e8b800',
          600: '#c9a000',
        },
        slate: {
          850: '#0f172a',
        }
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
    },
  },
  plugins: [],
}
