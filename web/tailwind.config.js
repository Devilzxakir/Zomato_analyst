/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f0',
          100: '#ffe0dc',
          200: '#ffb9af',
          300: '#ff8d7c',
          400: '#ff624a',
          500: '#e23744',
          600: '#c41e2c',
          700: '#9d1621',
          800: '#6b0d15',
          900: '#3a070c',
        },
        accent: {
          400: '#7c5cff',
          500: '#6244ff',
          600: '#4a30e0',
        },
        ink: {
          50: '#f7f8fb',
          100: '#eceff6',
          200: '#d6dbe6',
          300: '#a9b1c2',
          400: '#7a8299',
          500: '#525a73',
          600: '#363c52',
          700: '#22273a',
          800: '#15192a',
          900: '#0a0d1c',
          950: '#06081a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      backgroundImage: {
        'grid-dark':
          'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
        'grid-light':
          'linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(124,92,255,0.25), 0 8px 30px -8px rgba(124,92,255,0.45)',
        soft: '0 10px 40px -10px rgba(0,0,0,0.35)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
