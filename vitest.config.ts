import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: './test/setup.ts',
    coverage: {
      provider: 'c8',
      reporter: ['text', 'lcov'],
    },
  },
});
