/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Professional Black — GitHub / Apple inspired
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#58a6ff', // GitHub-style link blue
          500: '#388bfd',
          600: '#1f6feb',
          700: '#1958c5',
          800: '#1b4a9e',
          900: '#1b3a7a',
          950: '#12264f',
        },
        accent: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#3fb950', // GitHub green
          500: '#2ea043',
          600: '#238636',
          700: '#1a7f37',
          800: '#196c2e',
          900: '#0f5323',
          950: '#033a16',
        },
        dark: {
          50: '#f6f8fa',
          100: '#eaeef2',
          200: '#d0d7de',
          300: '#afb8c1',
          400: '#8b949e', // GitHub muted text
          500: '#6e7681',
          600: '#484f58',
          700: '#30363d', // GitHub border
          800: '#21262d', // GitHub surface
          900: '#161b22', // GitHub canvas-subtle
          950: '#0d1117', // GitHub canvas-default
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.04)',
          medium: 'rgba(255, 255, 255, 0.06)',
          heavy: 'rgba(255, 255, 255, 0.09)',
          border: 'rgba(255, 255, 255, 0.08)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(160deg, #0d1117 0%, #161b22 50%, #0d1117 100%)',
        'gradient-glow': 'linear-gradient(135deg, #388bfd, #58a6ff)',
        'hero-gradient': 'linear-gradient(160deg, #0d1117 0%, #161b22 40%, #0d1117 70%, #10161d 100%)',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(56, 139, 253, 0.15)',
        'glow-md': '0 0 20px rgba(56, 139, 253, 0.2)',
        'glow-lg': '0 0 40px rgba(56, 139, 253, 0.15)',
        'glow-cyan': '0 0 20px rgba(63, 185, 80, 0.2)',
        'glass': '0 8px 24px rgba(0, 0, 0, 0.4)',
        'card': '0 1px 3px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.12)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.5s ease-out forwards',
        'typewriter': 'typewriter 3s steps(40) forwards',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(56, 139, 253, 0.15)' },
          '50%': { boxShadow: '0 0 30px rgba(56, 139, 253, 0.3)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
