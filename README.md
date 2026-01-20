# Store Guard

A lightweight, framework-agnostic type-safe wrapper for browser storage with schema validation. Store your data safely with automatic validation, migrations, and cross-tab synchronization.

[![NPM Version](https://img.shields.io/npm/v/store-guard)](https://www.npmjs.com/package/store-guard)
[![NPM Downloads](https://img.shields.io/npm/dm/store-guard)](https://www.npmjs.com/package/store-guard)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/store-guard)](https://bundlephobia.com/package/store-guard)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## The Problem

Working with `localStorage` directly is risky. You lose type safety, get no validation, and errors can crash your app.

```typescript
// Traditional way - easy to break
const user = JSON.parse(localStorage.getItem('user') || '{}');
console.log(user.name.toUpperCase()); // Crashes if name is undefined!
```

## The Solution

Store Guard makes storage type-safe and validated. It catches errors before they happen.

```typescript
// Store Guard way - safe and reliable
import { z } from 'zod';
import { createStore } from 'store-guard';

const userStore = createStore({
  key: 'user',
  schema: z.object({ name: z.string(), age: z.number() }),
});

const user = userStore.get(); // Type-safe, always validated
console.log(user?.name.toUpperCase()); // Safe!
```

## Key Features

- **Type-Safe** - Full TypeScript support with strict types
- **Schema Validation** - Works with Zod, Valibot, or Yup
- **Version Migrations** - Update your data structure without losing data
- **TTL Support** - Auto-expire old data
- **Cross-Tab Sync** - Changes sync automatically across browser tabs
- **Smart Serialization** - Handles Date, Map, and Set automatically
- **Tiny Size** - Less than 3kb minified and gzipped
- **Zero Dependencies** - No external dependencies in the core

## Installation

```bash
npm install store-guard zod
```

You need a validation library. Zod is recommended, but Valibot and Yup also work.

## Quick Start

### Basic Usage

```typescript
import { z } from 'zod';
import { createStore } from 'store-guard';

// Define what your data should look like
const userStore = createStore({
  key: 'user',
  schema: z.object({
    name: z.string(),
    email: z.string().email(),
    age: z.number(),
  }),
});

// Save data
userStore.set({ name: 'John', email: 'john@example.com', age: 30 });

// Get data (type-safe and validated)
const user = userStore.get();

// Update data
userStore.update((current) => ({ ...current, age: (current?.age || 0) + 1 }));

// Remove data
userStore.remove();
```

### React Example

```tsx
import { useSafeStorage } from 'store-guard/react';
import { z } from 'zod';

function App() {
  const [user, setUser, { remove }] = useSafeStorage({
    key: 'user',
    schema: z.object({ name: z.string(), email: z.string().email() }),
    defaultValue: { name: 'Guest', email: '' },
  });

  return (
    <div>
      <h1>Hello, {user?.name}!</h1>
      <button onClick={() => setUser({ name: 'Jane', email: 'jane@example.com' })}>
        Update User
      </button>
      <button onClick={remove}>Clear</button>
    </div>
  );
}
```

### Vue Example

```vue
<script setup>
import { useSafeStorage } from 'store-guard/vue';
import { z } from 'zod';

const { value: user, set, remove } = useSafeStorage({
  key: 'user',
  schema: z.object({ name: z.string(), email: z.string().email() }),
});
</script>

<template>
  <div>
    <h1>Hello, {{ user?.name }}!</h1>
    <button @click="set({ name: 'Jane', email: 'jane@example.com' })">Update</button>
    <button @click="remove">Clear</button>
  </div>
</template>
```

## Advanced Features

### Data Migrations

When your data structure changes, migrate old data automatically:

```typescript
const userStore = createStore({
  key: 'user',
  schema: z.object({ firstName: z.string(), lastName: z.string() }),
  version: 2,
  migrate: (oldData) => {
    // Transform old format to new format
    const old = oldData as { name: string };
    const [firstName, lastName] = old.name.split(' ');
    return { firstName, lastName };
  },
});
```

### Auto-Expiring Data

Set data to expire after a certain time:

```typescript
const sessionStore = createStore({
  key: 'session',
  schema: z.object({ token: z.string() }),
  ttl: 1000 * 60 * 60, // Expires after 1 hour
});
```

### Cross-Tab Synchronization

Listen for changes across all browser tabs:

```typescript
const unsubscribe = userStore.onUpdate((newValue) => {
  console.log('Data updated:', newValue);
  // Update your UI here
});
```

### Smart Serialization

Store complex types without manual conversion:

```typescript
const dataStore = createStore({
  key: 'data',
  schema: z.object({
    createdAt: z.date(),
    tags: z.set(z.string()),
    metadata: z.map(z.string(), z.unknown()),
  }),
});

// Store Date, Map, and Set directly - they're handled automatically
dataStore.set({
  createdAt: new Date(),
  tags: new Set(['typescript', 'react']),
  metadata: new Map([['version', '1.0']]),
});
```

## API Reference

### createStore(options)

Creates a new store with validation.

**Options:**
- `key` (string, required) - Unique storage key
- `schema` (required) - Validation schema (Zod, Valibot, or Yup)
- `storageType` - `'local'` or `'session'` (default: `'local'`)
- `version` - Version number for migrations
- `migrate` - Function to transform old data to new format
- `ttl` - Time-to-live in milliseconds
- `defaultValue` - Default value if no data exists

**Store Methods:**
- `get()` - Get value from storage (returns null if invalid)
- `set(data)` - Save new value
- `update(fn)` - Update using a function
- `remove()` - Delete the value
- `onUpdate(callback)` - Subscribe to changes (returns unsubscribe function)
- `has()` - Check if valid data exists

### React Hook

```typescript
const [value, setValue, { remove, update, isLoading }] = useSafeStorage(options);
```

### Vue Composable

```typescript
const { value, set, update, remove, isLoading } = useSafeStorage(options);
```

## Browser Support

Works in all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Any browser with ES2020 support

## License

MIT
