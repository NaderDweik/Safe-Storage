# Module Splitting Implementation Guide

## Goal
Reduce core bundle from **4.4 KB** to **~2 KB** by splitting optional features.

---

## Step 1: Identify Heavy Modules

Current core includes:
- ✅ Store logic (~1.5 KB)
- ✅ Serializer (~0.5 KB)
- ⚠️ Compression (~1 KB) - Optional for most users
- ⚠️ Encryption (~0.5 KB) - Optional for most users
- ⚠️ Batch operations (~0.5 KB) - Advanced use case
- ⚠️ Cleanup (~0.8 KB) - Advanced use case
- ⚠️ Middleware (~0.6 KB) - Advanced use case
- ✅ Errors & Types (~0.5 KB) - Always needed

---

## Step 2: Restructure Exports

### Current (src/index.ts):
```typescript
// Exports everything
export * from './core/store';
export * from './core/serializer';
export * from './core/compression';
export * from './core/encryption';
export * from './core/batch';
export * from './core/cleanup';
export * from './core/middleware';
export * from './core/errors';
```

### Proposed Structure:

```
src/
├── index.ts              → Core only (store + serializer)
├── compression.ts        → Re-export from core/compression
├── encryption.ts         → Re-export from core/encryption
├── batch.ts             → Re-export from core/batch
├── cleanup.ts           → Re-export from core/cleanup
├── middleware.ts        → Re-export from core/middleware
└── core/
    ├── store.ts
    ├── serializer.ts
    ├── compression.ts
    ├── encryption.ts
    ├── batch.ts
    ├── cleanup.ts
    ├── middleware.ts
    └── errors.ts
```

---

## Step 3: Update Entry Points

### package.json:
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./compression": {
      "types": "./dist/compression.d.ts",
      "import": "./dist/compression.mjs",
      "require": "./dist/compression.js"
    },
    "./encryption": {
      "types": "./dist/encryption.d.ts",
      "import": "./dist/encryption.mjs",
      "require": "./dist/encryption.js"
    },
    "./batch": {
      "types": "./dist/batch.d.ts",
      "import": "./dist/batch.mjs",
      "require": "./dist/batch.js"
    },
    "./cleanup": {
      "types": "./dist/cleanup.d.ts",
      "import": "./dist/cleanup.mjs",
      "require": "./dist/cleanup.js"
    },
    "./middleware": {
      "types": "./dist/middleware.d.ts",
      "import": "./dist/middleware.mjs",
      "require": "./dist/middleware.js"
    }
  }
}
```

### tsup.config.ts:
```typescript
import { defineConfig } from 'tsup';

export default defineConfig([
  // Core (minimal)
  {
    entry: {
      index: 'src/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    minify: true,
    treeshake: true,
    splitting: true,
  },
  // Optional features
  {
    entry: {
      compression: 'src/compression.ts',
      encryption: 'src/encryption.ts',
      batch: 'src/batch.ts',
      cleanup: 'src/cleanup.ts',
      middleware: 'src/middleware.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    minify: true,
    treeshake: true,
    splitting: true,
  },
  // ... rest of your config
]);
```

---

## Step 4: Update src/index.ts (Core Only)

```typescript
/**
 * SafeStorage - Core Module
 * Only includes essential functionality
 */

// Core exports
export { createStore } from './core/store';
export { defaultSerializer } from './core/serializer';

// Types (always needed)
export type {
  Store,
  StoreOptions,
  StorageType,
  SchemaValidator,
  ValidationResult,
  MigrationFunction,
  Serializer,
  StoredData,
} from './types';

// Common errors (lightweight)
export {
  SafeStorageError,
  ValidationError,
  MigrationError,
} from './core/errors';

// Note: For compression, encryption, batch, cleanup, and middleware,
// import from their respective modules:
// import { createLZCompressor } from 'safe-storage/compression';
```

---

## Step 5: Create Feature Entry Points

### src/compression.ts:
```typescript
/**
 * Compression utilities for SafeStorage
 * Import only when you need compression
 */
export { createLZCompressor } from './core/compression';
export type { Compressor } from './types';
```

### src/encryption.ts:
```typescript
/**
 * Encryption utilities for SafeStorage
 * Import only when you need encryption
 */
export { createWebCryptoEncryptor } from './core/encryption';
export type { Encryptor } from './types';
```

### src/batch.ts:
```typescript
/**
 * Batch operations for SafeStorage
 * Import only for advanced use cases
 */
export {
  batchSet,
  batchGet,
  batchRemove,
  batchTransaction,
  clearWithPrefix,
  getAllKeys,
} from './core/batch';
```

### src/cleanup.ts:
```typescript
/**
 * Storage cleanup utilities
 * Import only when you need auto-cleanup
 */
export {
  cleanupStorage,
  scheduleCleanup,
  getStorageStats,
} from './core/cleanup';
export type { CleanupOptions, CleanupStrategy } from './types';
```

### src/middleware.ts:
```typescript
/**
 * Middleware system for SafeStorage
 * Import only for advanced customization
 */
export {
  applyMiddleware,
  loggerMiddleware,
  performanceMiddleware,
} from './core/middleware';
export type { Middleware, MiddlewareContext } from './types';
```

---

## Step 6: Update Documentation

### README.md:

```markdown
## Bundle Size

SafeStorage is designed to be tree-shakeable and modular:

| Import | Size (Gzipped) | Use Case |
|--------|---------------|----------|
| Core only | **~2 KB** | Basic storage with type safety |
| + Compression | **+1 KB** | Large data storage |
| + Encryption | **+0.5 KB** | Sensitive data |
| + Batch ops | **+0.5 KB** | Multiple operations |
| + Cleanup | **+0.8 KB** | Auto-expire data |
| + Middleware | **+0.6 KB** | Custom logic |
| **Full bundle** | **~4.4 KB** | All features |

### Examples

**Minimal (2 KB):**
\`\`\`typescript
import { createStore } from 'safe-storage';

const store = createStore({
  key: 'user',
  schema: userSchema,
});
\`\`\`

**With Compression (3 KB):**
\`\`\`typescript
import { createStore } from 'safe-storage';
import { createLZCompressor } from 'safe-storage/compression';

const store = createStore({
  key: 'large-data',
  schema: dataSchema,
  compressor: createLZCompressor(),
});
\`\`\`

**With All Features (4.4 KB):**
\`\`\`typescript
import { createStore } from 'safe-storage';
import { createLZCompressor } from 'safe-storage/compression';
import { createWebCryptoEncryptor } from 'safe-storage/encryption';
import { loggerMiddleware } from 'safe-storage/middleware';

const store = createStore({
  key: 'secure-data',
  schema: dataSchema,
  compressor: createLZCompressor(),
  encryptor: createWebCryptoEncryptor('key'),
  middleware: [loggerMiddleware],
});
\`\`\`
```

---

## Step 7: Migrate Existing Code

Users upgrading will need to update imports:

### Before:
```typescript
import { createStore, createLZCompressor, batchSet } from 'safe-storage';
```

### After:
```typescript
import { createStore } from 'safe-storage';
import { createLZCompressor } from 'safe-storage/compression';
import { batchSet } from 'safe-storage/batch';
```

---

## Expected Results

### Before Module Splitting:
```
index.mjs: 12.2 KB → 4.4 KB gzipped
```

### After Module Splitting:
```
index.mjs:        ~2 KB gzipped  (Core only)
compression.mjs:  ~1 KB gzipped  (Optional)
encryption.mjs:   ~0.5 KB gzipped (Optional)
batch.mjs:        ~0.5 KB gzipped (Optional)
cleanup.mjs:      ~0.8 KB gzipped (Optional)
middleware.mjs:   ~0.6 KB gzipped (Optional)
```

**Users import only what they need!**

---

## Testing the Changes

```bash
# Build with new structure
npm run build

# Check core size
ls -lh dist/index.mjs

# Check gzipped size
gzip -c dist/index.mjs | wc -c

# Test tree-shaking
# Create a test file that only imports createStore
echo "import { createStore } from './dist/index.mjs'" > test-tree-shake.mjs
node --input-type=module test-tree-shake.mjs
```

---

## Migration Guide for Users

### v1.x → v2.x (Breaking Change)

**Old:**
```typescript
import { 
  createStore, 
  createLZCompressor,
  batchSet,
  cleanupStorage 
} from 'safe-storage';
```

**New:**
```typescript
import { createStore } from 'safe-storage';
import { createLZCompressor } from 'safe-storage/compression';
import { batchSet } from 'safe-storage/batch';
import { cleanupStorage } from 'safe-storage/cleanup';
```

**Benefits for users:**
- ✅ Smaller bundle if only using core features
- ✅ Explicit about which features they're using
- ✅ Better code splitting in their apps

---

## Recommendation

**For v1.x:** Keep current structure (4.4 KB is fine!)

**For v2.x:** Implement module splitting if:
- Users request it
- You see adoption growing
- You want to emphasize the lightweight core

**Current verdict:** Your package is already well-optimized at 4.4 KB for ALL features. Module splitting is optional and can wait for v2.0!
