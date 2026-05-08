import type { Config } from 'tailwindcss';
import path from 'path';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    path.join(__dirname, '../../packages/ui/src/**/*.{ts,tsx}'),
  ],
  theme: {
    extend: {
      colors: {
        // Brand âmbar
        amber: {
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          900: '#451A03',
        },
        // Brand alias
        brand: {
          primary: '#F59E0B',
          secondary: '#D97706',
          DEFAULT: '#F59E0B',
        },
        // Dark surfaces
        dark: {
          500: '#2A4166',
          600: '#1E304D',
          700: '#17253C',
          800: '#111C2E',
          900: '#0C1220',
          950: '#060A12',
          border: 'rgba(255,255,255,0.07)',
          'border-med': 'rgba(255,255,255,0.12)',
        },
        // Status (semantic)
        status: {
          available: '#22C55E',
          allocated: '#F59E0B',
          maintenance: '#60A5FA',
          lost: '#F87171',
        },
        // Text
        text: {
          primary: '#F1F5F9',
          secondary: '#94A3B8',
          muted: '#475569',
          'on-light': '#0F172A',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Barlow Condensed', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'Barlow', 'system-ui', 'sans-serif'],
        semi: ['var(--font-semi)', 'Barlow Semi Condensed', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xs: '4px',
      },
      boxShadow: {
        'amber-glow': '0 0 20px rgba(245,158,11,0.2)',
        'amber-soft': '0 2px 8px rgba(245,158,11,0.3)',
        'amber-strong': '0 4px 16px rgba(245,158,11,0.4)',
      },
      keyframes: {
        'scan-line': {
          '0%': { top: '20%', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { top: '80%', opacity: '0' },
        },
      },
      animation: {
        'scan-line': 'scan-line 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
