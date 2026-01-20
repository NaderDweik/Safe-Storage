import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    sourcemap: false, // Removed for smaller NPM package
    minify: 'terser', // Use terser for smaller bundles
    terserOptions: {
      compress: {
        passes: 2, // Multiple passes for better compression
      },
      mangle: true,
    },
    treeshake: true,
    splitting: true,
  },
  {
    entry: {
      react: 'src/react/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: { passes: 2 },
      mangle: true,
    },
    treeshake: true,
    external: ['react'],
    splitting: true,
  },
  {
    entry: {
      vue: 'src/vue/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: { passes: 2 },
      mangle: true,
    },
    treeshake: true,
    external: ['vue'],
    splitting: true,
  },
  {
    entry: {
      svelte: 'src/svelte/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: { passes: 2 },
      mangle: true,
    },
    treeshake: true,
    external: ['svelte', 'svelte/store'],
    splitting: true,
  },
  {
    entry: {
      'adapters/indexeddb': 'src/adapters/indexeddb.ts',
      'adapters/react-native': 'src/adapters/react-native.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: { passes: 2 },
      mangle: true,
    },
    treeshake: true,
    splitting: true,
  },
  {
    entry: {
      devtools: 'src/devtools/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: { passes: 2 },
      mangle: true,
    },
    treeshake: true,
    splitting: true,
  },
]);
