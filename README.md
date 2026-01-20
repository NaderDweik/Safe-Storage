# SafeStorage

A high-performance, framework-agnostic type-safe wrapper for browser storage with schema validation.

[![NPM Version](https://img.shields.io/npm/v/safe-storage)](https://www.npmjs.com/package/safe-storage)
[![NPM Downloads](https://img.shields.io/npm/dm/safe-storage)](https://www.npmjs.com/package/safe-storage)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/safe-storage)](https://bundlephobia.com/package/safe-storage)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/yourusername/safe-storage)](https://github.com/yourusername/safe-storage)

## Why SafeStorage?

### The Problem

```typescript
// Traditional approach - prone to errors
const user = JSON.parse(localStorage.getItem('user') || '{}');
console.log(user.name.toUpperCase());
// Error: Cannot read property 'toUpperCase' of undefined
```

### The Solution

```typescript
// SafeStorage - type-safe and validated
import { z } from 'zod';
import { createStore } from 'safe-storage';

const userStore = createStore({
  key: 'user',
  schema: z.object({
    name: z.string(),
    age: z.number(),
  }),
});

const user = userStore.get(); // { name: string, age: number } | null
if (user) {
  console.log(user.name.toUpperCase()); // Safe and type-checked
}
```

## Features

:heavy_check_mark: **Type-Safe**: Full TypeScript support with strict types  
:heavy_check_mark: **Schema Validation**: Works with Zod, Valibot, Yup, or custom validators  
:heavy_check_mark: **Version Migrations**: Seamlessly migrate data when your schema changes  
:heavy_check_mark: **TTL Support**: Automatic expiration of stored data  
:heavy_check_mark: **Cross-Tab Sync**: Reactively update when storage changes in other tabs  
:heavy_check_mark: **Smart Serialization**: Automatically handles Date, Map, and Set objects  
:heavy_check_mark: **Graceful Errors**: Validation failures don't crash your app  
:heavy_check_mark: **Framework Agnostic**: Use with vanilla JS, React, Vue, or any framework  
:heavy_check_mark: **Tiny Bundle**: < 3kb minified + gzipped  
:heavy_check_mark: **Zero Dependencies**: Core has no dependencies

## Installation

```bash
npm install safe-storage

# Peer dependencies (choose your validator)
npm install zod
# or
npm install valibot
```

## Quick Start

### Vanilla JavaScript/TypeScript

```typescript
import { z } from 'zod';
import { createStore } from 'safe-storage';

// Define your schema
const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().min(0),
});

// Create a store
const userStore = createStore({
  key: 'user',
  schema: userSchema,
  storageType: 'local', // 'local' or 'session'
});

// Use the store
userStore.set({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
});

const user = userStore.get(); // Validated and type-safe
console.log(user?.name); // John Doe

// Update
userStore.update((current) => ({
  ...current,
  age: (current?.age || 0) + 1,
}));

// Remove
userStore.remove();
```

### React

```tsx
import { z } from 'zod';
import { useSafeStorage } from 'safe-storage/react';

const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

function App() {
  const [user, setUser, { remove, isLoading }] = useSafeStorage({
    key: 'user',
    schema: userSchema,
    defaultValue: { name: 'Guest', email: '' },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Hello, {user?.name}!</h1>
      <button
        onClick={() =>
          setUser({ name: 'Jane', email: 'jane@example.com' })
        }
      >
        Update User
      </button>
      <button onClick={remove}>Clear</button>
    </div>
  );
}
```

### Vue

```vue
<script setup lang="ts">
import { z } from 'zod';
import { useSafeStorage } from 'safe-storage/vue';

const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

const { value: user, set, remove, isLoading } = useSafeStorage({
  key: 'user',
  schema: userSchema,
  defaultValue: { name: 'Guest', email: '' },
});

function updateUser() {
  set({ name: 'Jane', email: 'jane@example.com' });
}
</script>

<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <div v-else>
      <h1>Hello, {{ user?.name }}!</h1>
      <button @click="updateUser">Update User</button>
      <button @click="remove">Clear</button>
    </div>
  </div>
</template>
```

## Advanced Features

### Version Migrations

When your data structure changes, migrate existing data instead of losing it:

```typescript
import { z } from 'zod';
import { createStore } from 'safe-storage';

// Old schema: { name: string }
// New schema: { firstName: string, lastName: string }

const userSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
});

const userStore = createStore({
  key: 'user',
  schema: userSchema,
  version: 2,
  migrate: (oldData) => {
    // Transform old data to new format
    const old = oldData as { name: string };
    const [firstName, lastName] = old.name.split(' ');
    return { firstName, lastName };
  },
});
```

### TTL (Time-To-Live)

Automatically expire data after a certain time:

```typescript
const sessionStore = createStore({
  key: 'session',
  schema: z.object({ token: z.string() }),
  ttl: 1000 * 60 * 60, // 1 hour in milliseconds
});

sessionStore.set({ token: 'abc123' });

// After 1 hour, get() will return null
setTimeout(() => {
  console.log(sessionStore.get()); // null
}, 1000 * 60 * 60 + 100);
```

### Cross-Tab Synchronization

Listen for changes across browser tabs:

```typescript
const themeStore = createStore({
  key: 'theme',
  schema: z.enum(['light', 'dark']),
});

// Subscribe to changes (including from other tabs)
const unsubscribe = themeStore.onUpdate((newTheme) => {
  console.log('Theme changed to:', newTheme);
  document.body.className = newTheme || 'light';
});

// Clean up when done
unsubscribe();
```

### Smart Serialization

Automatically handles complex types:

```typescript
const dataStore = createStore({
  key: 'data',
  schema: z.object({
    createdAt: z.date(),
    tags: z.set(z.string()),
    metadata: z.map(z.string(), z.unknown()),
  }),
});

dataStore.set({
  createdAt: new Date(),
  tags: new Set(['typescript', 'react']),
  metadata: new Map([['version', '1.0']]),
});

const data = dataStore.get();
console.log(data?.createdAt instanceof Date); // true
console.log(data?.tags instanceof Set); // true
console.log(data?.metadata instanceof Map); // true
```

### Graceful Error Handling

Handle validation failures gracefully:

```typescript
const userStore = createStore({
  key: 'user',
  schema: z.object({
    name: z.string(),
    age: z.number(),
  }),
  defaultValue: { name: 'Guest', age: 0 },
  onValidationError: (error, key) => {
    console.error(`Validation failed for ${key}:`, error);
    // Log to monitoring service
  },
});

// If stored data is corrupted or invalid, get() returns defaultValue
const user = userStore.get(); // Always safe
```

### Using with Valibot

```typescript
import * as v from 'valibot';
import { createStore } from 'safe-storage';

const userSchema = v.object({
  name: v.string(),
  email: v.pipe(v.string(), v.email()),
  age: v.pipe(v.number(), v.minValue(0)),
});

const userStore = createStore({
  key: 'user',
  schema: {
    parse: (data) => v.parse(userSchema, data),
    safeParse: (data) => {
      try {
        return {
          success: true,
          data: v.parse(userSchema, data),
        };
      } catch (error) {
        return {
          success: false,
          error,
        };
      }
    },
  },
});
```

### Using with Yup

```typescript
import * as yup from 'yup';
import { createStore } from 'safe-storage';

const userSchema = yup.object({
  name: yup.string().required(),
  email: yup.string().email().required(),
  age: yup.number().min(0).required(),
});

const userStore = createStore({
  key: 'user',
  schema: {
    parse: (data) => userSchema.validateSync(data),
    safeParse: (data) => {
      try {
        return {
          success: true,
          data: userSchema.validateSync(data),
        };
      } catch (error) {
        return {
          success: false,
          error,
        };
      }
    },
  },
});
```

## API Reference

### `createStore<T>(options: StoreOptions<T>): Store<T>`

Creates a type-safe storage store.

#### Options

| Option | Type | Description |
|--------|------|-------------|
| `key` | `string` | Unique key for storage (required) |
| `schema` | `SchemaValidator<T>` | Schema validator (required) |
| `storageType` | `'local' \| 'session'` | Storage type (default: `'local'`) |
| `version` | `number` | Version number for migrations |
| `migrate` | `(oldData: unknown) => T` | Migration function |
| `ttl` | `number` | Time-to-live in milliseconds |
| `defaultValue` | `T` | Default value if no data exists |
| `onValidationError` | `(error: unknown, key: string) => void` | Validation error handler |
| `serializer` | `Serializer` | Custom serializer |

#### Store Methods

| Method | Description |
|--------|-------------|
| `get()` | Get the current value from storage |
| `set(data)` | Set a new value in storage |
| `update(fn)` | Update the value using an updater function |
| `remove()` | Remove the value from storage |
| `onUpdate(callback)` | Subscribe to updates (returns unsubscribe function) |
| `has()` | Check if the store has valid data |
| `getRaw()` | Get the raw stored data (for debugging) |

### React Hook: `useSafeStorage<T>(options: StoreOptions<T>)`

Returns a tuple:

```typescript
[
  value: T | null,
  setValue: (data: T) => void,
  {
    remove: () => void,
    update: (fn: (current: T | null) => T) => void,
    isLoading: boolean,
    store: Store<T>
  }
]
```

### Vue Composable: `useSafeStorage<T>(options: StoreOptions<T>)`

Returns an object:

```typescript
{
  value: Ref<T | null>,
  set: (data: T) => void,
  update: (fn: (current: T | null) => T) => void,
  remove: () => void,
  has: () => boolean,
  isLoading: Ref<boolean>,
  store: Store<T>
}
```

## Best Practices

### Do's

**Create reusable store instances**

```typescript
// stores/user.ts
export const userStore = createStore({
  key: 'user',
  schema: userSchema,
});

// Use across your app
import { userStore } from './stores/user';
```

**Use version migrations for schema changes**

```typescript
const store = createStore({
  key: 'data',
  schema: newSchema,
  version: 2,
  migrate: transformOldToNew,
});
```

**Handle validation errors gracefully**

```typescript
const store = createStore({
  key: 'data',
  schema: mySchema,
  defaultValue: fallbackData,
  onValidationError: logToMonitoring,
});
```

### Don'ts

**Don't use sensitive data without encryption**

```typescript
// Avoid storing tokens directly
const tokenStore = createStore({
  key: 'auth-token', // Bad: tokens should be in httpOnly cookies
  schema: z.string(),
});
```

**Don't store large data in localStorage**

```typescript
// localStorage has 5-10MB limit
// Use IndexedDB for large datasets instead
```

**Don't skip schema validation**

```typescript
// Bad: bypassing validation
localStorage.setItem('user', JSON.stringify(data));

// Good: always use the store
userStore.set(data); // Validated automatically
```

## Bundle Size

| Package | Size (minified + gzipped) |
|---------|--------------------------|
| Core | ~2.5kb |
| React Hook | ~0.8kb |
| Vue Composable | ~0.7kb |

## Browser Support

- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+
- All modern browsers with ES2020 support

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT

## Acknowledgments

Built with inspiration from:
- [Zustand](https://github.com/pmndrs/zustand)
- [TanStack Query](https://tanstack.com/query)
- [VueUse](https://vueuse.org/)

---

Made with :heavy_check_mark: for type-safe storage
