// Polyfill crypto before anything else
import './vitest.preamble';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'examples/',
        '**/*.test.ts',
        '**/*.test.tsx',
        'vitest.setup.ts',
        'vitest.config.ts',
        'vitest.preamble.ts',
        'tsup.config.ts',
      ],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
    },
  },
});
