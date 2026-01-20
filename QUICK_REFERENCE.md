# SafeStorage Quick Reference

Quick reference guide for common operations.

## Installation

```bash
npm install safe-storage zod
```

## Basic Usage

```typescript
import { z } from 'zod';
import { createStore } from 'safe-storage';

const store = createStore({
  key: 'my-data',
  schema: z.object({ name: z.string() }),
});

store.set({ name: 'John' });
const data = store.get();
store.remove();
```

## Core API

| Method | Description | Example |
|--------|-------------|---------|
| `get()` | Get value | `const data = store.get()` |
| `set(data)` | Set value | `store.set({ name: 'John' })` |
| `update(fn)` | Update value | `store.update(d => ({ ...d, age: 30 }))` |
| `remove()` | Remove value | `store.remove()` |
| `onUpdate(cb)` | Subscribe | `store.onUpdate(data => console.log(data))` |
| `has()` | Check exists | `if (store.has()) { ... }` |
| `getRaw()` | Get raw data | `console.log(store.getRaw())` |

## Store Options

| Option | Type | Description |
|--------|------|-------------|
| `key` | string | Storage key (required) |
| `schema` | Validator | Schema validator (required) |
| `storageType` | 'local' \| 'session' | Storage type |
| `version` | number | Version for migrations |
| `migrate` | Function | Migration function |
| `ttl` | number | Time-to-live (ms) |
| `defaultValue` | T | Default value |
| `onValidationError` | Function | Error handler |
| `serializer` | Serializer | Custom serializer |

## React

```tsx
import { useSafeStorage } from 'safe-storage/react';

function App() {
  const [data, setData, { remove, update, isLoading }] = useSafeStorage({
    key: 'data',
    schema: mySchema,
  });

  return <div>{data?.name}</div>;
}
```

## Vue

```vue
<script setup>
import { useSafeStorage } from 'safe-storage/vue';

const { value, set, remove, isLoading } = useSafeStorage({
  key: 'data',
  schema: mySchema,
});
</script>

<template>
  <div>{{ value?.name }}</div>
</template>
```

## Common Patterns

### With Default Value

```typescript
const store = createStore({
  key: 'theme',
  schema: z.enum(['light', 'dark']),
  defaultValue: 'light' as const,
});
```

### With TTL

```typescript
const store = createStore({
  key: 'session',
  schema: sessionSchema,
  ttl: 1000 * 60 * 60, // 1 hour
});
```

### With Migration

```typescript
const store = createStore({
  key: 'user',
  schema: newSchema,
  version: 2,
  migrate: (old) => transformToNew(old),
});
```

### With Error Handling

```typescript
const store = createStore({
  key: 'data',
  schema: mySchema,
  defaultValue: fallback,
  onValidationError: (err) => console.error(err),
});
```

### Cross-Tab Sync

```typescript
store.onUpdate((newData) => {
  console.log('Updated from another tab:', newData);
});
```

## Schema Validators

### Zod

```typescript
import { z } from 'zod';

const schema = z.object({
  name: z.string(),
  age: z.number(),
});
```

### Valibot

```typescript
import * as v from 'valibot';

const schema = {
  parse: (data) => v.parse(v.object({ ... }), data),
  safeParse: (data) => { ... },
};
```

### Yup

```typescript
import * as yup from 'yup';

const schema = {
  parse: (data) => yup.object({ ... }).validateSync(data),
  safeParse: (data) => { ... },
};
```

## TypeScript Types

```typescript
import type {
  Store,
  StoreOptions,
  SchemaValidator,
  ValidationResult,
} from 'safe-storage';
```

## Complex Types

### Date

```typescript
const schema = z.object({
  createdAt: z.date(),
});

store.set({ createdAt: new Date() });
const data = store.get();
console.log(data?.createdAt instanceof Date); // true
```

### Map

```typescript
const schema = z.object({
  data: z.map(z.string(), z.number()),
});

store.set({ data: new Map([['key', 123]]) });
```

### Set

```typescript
const schema = z.object({
  tags: z.set(z.string()),
});

store.set({ tags: new Set(['a', 'b']) });
```

## Best Practices

:heavy_check_mark: Always provide default values  
:heavy_check_mark: Use version migrations  
:heavy_check_mark: Handle validation errors  
:heavy_check_mark: Unsubscribe from updates  
:heavy_check_mark: Use TypeScript  

:x: Don't store sensitive data  
:x: Don't store large data  
:x: Don't skip validation  
:x: Don't use `any` types  

## Debugging

```typescript
// Check if data exists
if (!store.has()) {
  console.log('No data in storage');
}

// Get raw stored data
const raw = store.getRaw();
console.log('Raw data:', raw);

// Check version
console.log('Version:', raw?.version);
```

## Performance Tips

1. Use `update()` instead of `get()` + `set()`
2. Unsubscribe when components unmount
3. Use session storage for temporary data
4. Set TTL for data that expires

## Resources

- [Full Documentation](README.md)
- [Examples](EXAMPLES.md)
- [Setup Guide](SETUP.md)
- [Contributing](CONTRIBUTING.md)

---

For more details, see the [complete documentation](README.md).
