import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/*.vitest.ts'],
    reporters: ['verbose'],
    server: {
      port: 5502
    }
  }
});
