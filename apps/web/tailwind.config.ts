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
        brand: {
          primary: '#2563EB',
          secondary: '#1E40AF',
        },
        status: {
          available: '#16A34A',
          allocated: '#D97706',
          maintenance: '#9333EA',
          lost: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
