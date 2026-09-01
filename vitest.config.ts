import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['dist/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/db/prisma.ts', 'src/db/seed.ts'],
      thresholds: {
        lines: 75,
        functions: 80,
        branches: 65,
        statements: 75
      }
    }
  }
});
