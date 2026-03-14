import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/*.vitest.ts', 'assets/js/*.test.js'],
    reporters: ['verbose'],
    server: {
      port: 5502
    }
  }
});
