import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.spec.ts',
        'src/**/*.module.ts',
        'src/main.ts',
        'src/**/*.dto.ts',
        'src/**/dto/**',
        'src/**/*.controller.ts',
        'src/**/*.guard.ts',
        'src/**/*.strategy.ts',
        'src/**/*.decorator.ts',
        'src/prisma/**',
        'src/redis/**',
        'src/storage/**',
        'src/mail/**',
      ],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
});
