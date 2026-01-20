# SafeStorage Setup Guide

This guide will help you get started with SafeStorage in your project.

## Installation

### Core Package

```bash
npm install safe-storage
```

### Validation Libraries (Peer Dependencies)

Choose one based on your preference:

**Zod (Recommended)**
```bash
npm install zod
```

**Valibot**
```bash
npm install valibot
```

**Yup**
```bash
npm install yup
```

### Framework-Specific Setup

**React**
```bash
# React is automatically detected as a peer dependency
# Make sure you have React 16.8+ installed
npm install react@^16.8.0
```

**Vue**
```bash
# Vue is automatically detected as a peer dependency
# Make sure you have Vue 3+ installed
npm install vue@^3.0.0
```

## Quick Start

### 1. Create Your First Store

Create a new file `stores/user.ts`:

```typescript
import { z } from 'zod';
import { createStore } from 'safe-storage';

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

export type User = z.infer<typeof userSchema>;

export const userStore = createStore({
  key: 'app-user',
  schema: userSchema,
  storageType: 'local',
});
```

### 2. Use in Your Application

**Vanilla JavaScript/TypeScript**

```typescript
import { userStore } from './stores/user';

// Set user
userStore.set({
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
});

// Get user
const user = userStore.get();
console.log(user?.name);

// Update user
userStore.update((current) => ({
  ...current!,
  name: 'Jane Doe',
}));

// Subscribe to changes
const unsubscribe = userStore.onUpdate((user) => {
  console.log('User updated:', user);
});
```

**React**

```tsx
import { useSafeStorage } from 'safe-storage/react';
import { userSchema } from './stores/user';

function App() {
  const [user, setUser, { remove }] = useSafeStorage({
    key: 'app-user',
    schema: userSchema,
  });

  return (
    <div>
      {user ? (
        <div>
          <h1>Welcome, {user.name}!</h1>
          <button onClick={remove}>Logout</button>
        </div>
      ) : (
        <button onClick={() => setUser({
          id: '123',
          name: 'John Doe',
          email: 'john@example.com',
        })}>
          Login
        </button>
      )}
    </div>
  );
}
```

**Vue**

```vue
<script setup lang="ts">
import { useSafeStorage } from 'safe-storage/vue';
import { userSchema } from './stores/user';

const { value: user, set, remove } = useSafeStorage({
  key: 'app-user',
  schema: userSchema,
});

function login() {
  set({
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
  });
}
</script>

<template>
  <div>
    <div v-if="user">
      <h1>Welcome, {{ user.name }}!</h1>
      <button @click="remove">Logout</button>
    </div>
    <button v-else @click="login">Login</button>
  </div>
</template>
```

## Project Structure Recommendations

```
src/
├── stores/
│   ├── user.ts        # User store
│   ├── theme.ts       # Theme store
│   ├── cart.ts        # Shopping cart store
│   └── preferences.ts # User preferences
├── schemas/
│   └── index.ts       # Shared Zod schemas
└── App.tsx
```

Example `stores/theme.ts`:

```typescript
import { z } from 'zod';
import { createStore } from 'safe-storage';

const themeSchema = z.enum(['light', 'dark']);

export const themeStore = createStore({
  key: 'app-theme',
  schema: themeSchema,
  defaultValue: 'light' as const,
});

// Apply theme on load
const theme = themeStore.get();
if (theme) {
  document.body.setAttribute('data-theme', theme);
}

// Listen for changes
themeStore.onUpdate((newTheme) => {
  if (newTheme) {
    document.body.setAttribute('data-theme', newTheme);
  }
});
```

## Configuration Best Practices

### 1. Use TypeScript

SafeStorage is built with TypeScript and provides full type safety:

```typescript
const store = createStore({
  key: 'data',
  schema: z.object({ count: z.number() }),
});

const data = store.get(); // Type: { count: number } | null
```

### 2. Always Provide Default Values

```typescript
const store = createStore({
  key: 'data',
  schema: mySchema,
  defaultValue: { /* sensible defaults */ },
});
```

### 3. Handle Validation Errors

```typescript
const store = createStore({
  key: 'data',
  schema: mySchema,
  onValidationError: (error, key) => {
    console.error(`Validation failed for ${key}:`, error);
    // Log to your monitoring service
  },
});
```

### 4. Use Version Migrations

When your schema changes, migrate existing data:

```typescript
const store = createStore({
  key: 'data',
  schema: newSchema,
  version: 2,
  migrate: (oldData) => transformToNewFormat(oldData),
});
```

### 5. Set TTL for Sensitive Data

```typescript
const sessionStore = createStore({
  key: 'session',
  schema: sessionSchema,
  ttl: 1000 * 60 * 60, // 1 hour
});
```

## Common Patterns

### Authentication

```typescript
// stores/auth.ts
import { z } from 'zod';
import { createStore } from 'safe-storage';

const authSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
  }),
});

export const authStore = createStore({
  key: 'auth',
  schema: authSchema,
  ttl: 1000 * 60 * 60 * 24, // 24 hours
});

export function login(credentials) {
  const { token, user } = await authenticate(credentials);
  authStore.set({ token, user });
}

export function logout() {
  authStore.remove();
}

export function isAuthenticated() {
  return authStore.has();
}
```

### Shopping Cart

```typescript
// stores/cart.ts
import { z } from 'zod';
import { createStore } from 'safe-storage';

const cartItemSchema = z.object({
  id: z.string(),
  quantity: z.number(),
  price: z.number(),
});

export const cartStore = createStore({
  key: 'cart',
  schema: z.array(cartItemSchema),
  defaultValue: [],
});

export function addToCart(productId, price) {
  cartStore.update((cart) => {
    const existing = cart!.find((item) => item.id === productId);
    if (existing) {
      return cart!.map((item) =>
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }
    return [...cart!, { id: productId, quantity: 1, price }];
  });
}

export function getCartTotal() {
  const cart = cartStore.get();
  return cart?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
}
```

### User Preferences

```typescript
// stores/preferences.ts
import { z } from 'zod';
import { createStore } from 'safe-storage';

const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']),
  language: z.string(),
  notifications: z.boolean(),
});

export const preferencesStore = createStore({
  key: 'preferences',
  schema: preferencesSchema,
  defaultValue: {
    theme: 'auto' as const,
    language: 'en',
    notifications: true,
  },
});

export function updateTheme(theme) {
  preferencesStore.update((prefs) => ({ ...prefs!, theme }));
}
```

## Troubleshooting

### Issue: Data not persisting

**Solution:** Check that you're using the correct storage type and key:

```typescript
// Make sure storageType matches your needs
const store = createStore({
  key: 'my-data',
  storageType: 'local', // 'local' persists, 'session' clears on tab close
  schema: mySchema,
});
```

### Issue: Validation errors

**Solution:** Add error handling:

```typescript
const store = createStore({
  key: 'data',
  schema: mySchema,
  defaultValue: fallbackValue,
  onValidationError: (error) => {
    console.error('Validation failed:', error);
  },
});
```

### Issue: Cross-tab sync not working

**Solution:** Make sure you're using `onUpdate`:

```typescript
store.onUpdate((newValue) => {
  // This will be called when other tabs update the value
  console.log('Updated from another tab:', newValue);
});
```

### Issue: Migration not running

**Solution:** Ensure version number is incremented:

```typescript
const store = createStore({
  key: 'data',
  version: 2, // Must be higher than stored version
  migrate: transformData,
  schema: newSchema,
});
```

## Next Steps

1. Read the [full documentation](README.md)
2. Check out [comprehensive examples](EXAMPLES.md)
3. Explore [contributing guidelines](CONTRIBUTING.md)
4. Review the [changelog](CHANGELOG.md)

## Support

- GitHub Issues: [Report bugs or request features]
- Documentation: [Read the full docs]
- Examples: [Browse example code]

Happy coding with SafeStorage! :heavy_check_mark:
