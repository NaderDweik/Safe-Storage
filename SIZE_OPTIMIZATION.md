# Bundle Size Optimization Guide

## Current Status
Core: **~12 KB** (minified)  
Target: **< 3 KB** for minimal use cases

## Optimization Strategies

### 1. **Split Core into Separate Modules** (HIGHEST IMPACT)
Instead of bundling everything in `index.ts`, create separate entry points:

```
safe-storage              → Core only (~2-3 KB)
safe-storage/compression  → Compression utilities
safe-storage/encryption   → Encryption utilities
safe-storage/batch        → Batch operations
safe-storage/cleanup      → Cleanup utilities
safe-storage/middleware   → Middleware system
```

**Implementation:**
```typescript
// User imports only what they need
import { createStore } from 'safe-storage';
import { createLZCompressor } from 'safe-storage/compression';
```

**Benefit:** Users who only need basic storage won't download compression/encryption code.

---

### 2. **Make Advanced Features Optional** (HIGH IMPACT)
Move these to separate packages or opt-in imports:
- Compression (LZ-string is heavy)
- Encryption (Web Crypto API wrappers)
- Middleware system
- DevTools integration
- Batch operations
- Auto-cleanup

---

### 3. **Remove Source Maps from Production** (MEDIUM IMPACT)
```typescript
// tsup.config.ts
export default defineConfig({
  sourcemap: process.env.NODE_ENV !== 'production',
  // Or remove entirely for NPM
  sourcemap: false,
});
```

**Benefit:** Reduces download size by ~50-60% (source maps are huge)

---

### 4. **Use Terser for Better Minification** (MEDIUM IMPACT)
```bash
npm install --save-dev @rollup/plugin-terser
```

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  minify: 'terser',
  minifyOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true,
      pure_funcs: ['console.log'],
    },
    mangle: {
      toplevel: true,
    },
  },
});
```

---

### 5. **Enable Code Splitting** (MEDIUM IMPACT)
```typescript
// tsup.config.ts
export default defineConfig({
  splitting: true, // Currently false
  treeshake: true,
});
```

**Benefit:** Common code shared between modules

---

### 6. **Remove Unused Exports** (LOW-MEDIUM IMPACT)
Currently exporting everything from `src/index.ts`. Users might not need:
- All error classes
- All middleware functions
- Utility functions they don't use

**Solution:** Use named exports and let tree-shaking work

---

### 7. **Optimize Serialization Logic** (LOW IMPACT)
The current serializer is comprehensive but could be simplified:
- Make Map/Set serialization optional
- Use simpler Date handling (ISO strings only)
- Remove undefined handling (edge case)

---

### 8. **Use Smaller Dependencies** (VARIES)
Current approach is good (zero dependencies), but if you add any:
- Avoid heavy validation libraries in core
- Use lightweight alternatives

---

## Recommended Implementation Priority

### Phase 1: Quick Wins (Now)
1. ✅ Remove source maps from production builds
2. ✅ Switch to Terser minification
3. ✅ Enable code splitting
4. ✅ Remove console.log statements

**Expected Result:** Core reduces to ~8-9 KB

### Phase 2: Structural Changes (Next)
1. Split core into separate modules
2. Make compression/encryption separate packages
3. Move middleware to separate export

**Expected Result:** Minimal core reduces to ~2-3 KB

### Phase 3: Advanced (Future)
1. Create a "lite" version with minimal features
2. Optimize serialization
3. Benchmark and profile

---

## Example: Minimal Build Configuration

```typescript
// tsup.config.minimal.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'index': 'src/core/store.ts',        // Core only
    'serializer': 'src/core/serializer.ts',
  },
  format: ['esm'],                        // ESM only
  dts: true,
  clean: true,
  sourcemap: false,                       // No source maps
  minify: 'terser',                       // Better minification
  treeshake: true,
  splitting: true,                        // Code splitting
  minifyOptions: {
    compress: {
      drop_console: true,
      passes: 3,                          // Multiple passes
    },
  },
  external: [],                           // No dependencies
});
```

---

## User Documentation Example

```markdown
## Bundle Size

- **Core**: 2.5 KB (gzipped)
- **+ Compression**: +1.2 KB
- **+ Encryption**: +0.8 KB
- **+ Batch Ops**: +0.5 KB
- **Full Bundle**: ~12 KB

### Tree-shaking

Our package is fully tree-shakeable. Import only what you need:

\`\`\`typescript
// Minimal - 2.5 KB
import { createStore } from 'safe-storage';

// With compression - 3.7 KB
import { createStore } from 'safe-storage';
import { createLZCompressor } from 'safe-storage/compression';

// Full features - 12 KB
import * as SafeStorage from 'safe-storage';
\`\`\`
```

---

## Analysis Tools

Use these to track improvements:

```bash
# Bundle size analysis
npx bundlephobia safe-storage

# Local analysis
npm install --save-dev bundle-analyzer
npx bundle-analyzer dist/index.mjs
```

---

## Target Sizes (Gzipped)

| Package | Minimal | Full |
|---------|---------|------|
| Core | 1-2 KB | 4-5 KB |
| React | 1 KB | 2 KB |
| Vue | 1 KB | 2 KB |

These are achievable with proper code splitting!
