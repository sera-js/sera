import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        css: true,
        environment: 'jsdom',
        setupFiles: './test/setup.ts',
        include: ['test/**/*.test.{ts,tsx}'],
    }
});