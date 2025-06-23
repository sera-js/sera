import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        css: true,
        environment: 'jsdom',
        setupFiles: './tests/setup.ts',
        include: ['tests/**/*.test.{ts,tsx}'],
    }
});