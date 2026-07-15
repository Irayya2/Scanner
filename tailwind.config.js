/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neon green accent palette
        neon: {
          50:  '#f0fff4',
          100: '#c6f6d5',
          200: '#9ae6b4',
          300: '#68d391',
          400: '#48bb78',
          500: '#39ff14', // true neon green
          600: '#22c55e',
          700: '#16a34a',
          800: '#15803d',
          900: '#14532d',
        },
        // Dark background palette
        dark: {
          50:  '#1a1a1a',
          100: '#141414',
          200: '#111111',
          300: '#0d0d0d',
          400: '#0a0a0a',
          500: '#050505',
          600: '#020202',
          700: '#000000',
        },
        // Glass surfaces
        glass: {
          light: 'rgba(255,255,255,0.05)',
          medium: 'rgba(255,255,255,0.08)',
          heavy: 'rgba(255,255,255,0.12)',
          border: 'rgba(255,255,255,0.1)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'neon-sm':  '0 0 10px rgba(57,255,20,0.3)',
        'neon':     '0 0 20px rgba(57,255,20,0.4)',
        'neon-lg':  '0 0 40px rgba(57,255,20,0.5)',
        'neon-xl':  '0 0 60px rgba(57,255,20,0.6)',
        'glass':    '0 8px 32px rgba(0,0,0,0.6)',
        'card':     '0 4px 24px rgba(0,0,0,0.8)',
      },
      animation: {
        'pulse-neon':   'pulse-neon 2s ease-in-out infinite',
        'scan-line':    'scan-line 2s linear infinite',
        'glow-in':      'glow-in 0.5s ease-out forwards',
        'slide-up':     'slide-up 0.4s ease-out forwards',
        'fade-in':      'fade-in 0.3s ease-out forwards',
        'matrix':       'matrix 20s linear infinite',
        'blink':        'blink 1s step-end infinite',
        'spin-slow':    'spin 3s linear infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(57,255,20,0.3)' },
          '50%':       { boxShadow: '0 0 30px rgba(57,255,20,0.8), 0 0 60px rgba(57,255,20,0.4)' },
        },
        'scan-line': {
          '0%':   { top: '0%' },
          '100%': { top: '100%' },
        },
        'glow-in': {
          from: { opacity: '0', transform: 'scale(0.95)', filter: 'blur(4px)' },
          to:   { opacity: '1', transform: 'scale(1)',    filter: 'blur(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
