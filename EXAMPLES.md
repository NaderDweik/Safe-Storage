# SafeStorage Examples

This document provides comprehensive examples for using SafeStorage in various scenarios.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Version Migrations](#version-migrations)
- [TTL (Time-To-Live)](#ttl-time-to-live)
- [Cross-Tab Sync](#cross-tab-sync)
- [Complex Types](#complex-types)
- [Error Handling](#error-handling)
- [React Examples](#react-examples)
- [Vue Examples](#vue-examples)
- [Real-World Scenarios](#real-world-scenarios)

## Basic Usage

### Simple String Storage

```typescript
import { z } from 'zod';
import { createStore } from 'safe-storage';

const nameStore = createStore({
  key: 'username',
  schema: z.string(),
  defaultValue: 'Guest',
});

nameStore.set('John Doe');
console.log(nameStore.get()); // "John Doe"
```

### Object Storage

```typescript
const userStore = createStore({
  key: 'user',
  schema: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
  }),
});

userStore.set({
  id: '123',
  name: 'Jane',
  email: 'jane@example.com',
});
```

### Array Storage

```typescript
const todosStore = createStore({
  key: 'todos',
  schema: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      completed: z.boolean(),
    })
  ),
  defaultValue: [],
});

todosStore.update((todos) => [
  ...todos!,
  { id: '1', text: 'Buy milk', completed: false },
]);
```

## Version Migrations

### Migrating User Schema

```typescript
// v1: { fullName: string }
// v2: { firstName: string, lastName: string }

const userStoreV2 = createStore({
  key: 'user-profile',
  schema: z.object({
    firstName: z.string(),
    lastName: z.string(),
  }),
  version: 2,
  migrate: (oldData) => {
    const v1 = oldData as { fullName: string };
    const [firstName, ...lastNameParts] = v1.fullName.split(' ');
    return {
      firstName: firstName || '',
      lastName: lastNameParts.join(' ') || '',
    };
  },
});
```

### Adding New Fields

```typescript
// v1: { name: string }
// v2: { name: string, email: string, createdAt: Date }

const userStoreV2 = createStore({
  key: 'user',
  schema: z.object({
    name: z.string(),
    email: z.string().email(),
    createdAt: z.date(),
  }),
  version: 2,
  migrate: (oldData) => {
    const v1 = oldData as { name: string };
    return {
      name: v1.name,
      email: '', // Default for new field
      createdAt: new Date(), // Default timestamp
    };
  },
});
```

## TTL (Time-To-Live)

### Session Token with Expiration

```typescript
const sessionStore = createStore({
  key: 'auth-session',
  schema: z.object({
    token: z.string(),
    userId: z.string(),
  }),
  ttl: 1000 * 60 * 60 * 24, // 24 hours
});

sessionStore.set({ token: 'abc123', userId: 'user-1' });

// After 24 hours, get() returns null automatically
```

### Cache with TTL

```typescript
const cacheStore = createStore({
  key: 'api-cache',
  schema: z.object({
    data: z.unknown(),
    timestamp: z.number(),
  }),
  ttl: 1000 * 60 * 5, // 5 minutes
});

// Cache API response
cacheStore.set({
  data: await fetchData(),
  timestamp: Date.now(),
});
```

## Cross-Tab Sync

### Theme Synchronization

```typescript
const themeStore = createStore({
  key: 'theme',
  schema: z.enum(['light', 'dark']),
  defaultValue: 'light' as const,
});

// Listen for changes from other tabs
themeStore.onUpdate((newTheme) => {
  document.body.setAttribute('data-theme', newTheme || 'light');
});

// Change in one tab updates all tabs
themeStore.set('dark');
```

### Real-Time Notifications

```typescript
const notificationsStore = createStore({
  key: 'notifications',
  schema: z.array(
    z.object({
      id: z.string(),
      message: z.string(),
      read: z.boolean(),
    })
  ),
  defaultValue: [],
});

notificationsStore.onUpdate((notifications) => {
  const unread = notifications?.filter((n) => !n.read).length || 0;
  updateBadge(unread);
});
```

## Complex Types

### Date Objects

```typescript
const eventStore = createStore({
  key: 'event',
  schema: z.object({
    name: z.string(),
    startDate: z.date(),
    endDate: z.date(),
  }),
});

eventStore.set({
  name: 'Conference',
  startDate: new Date('2026-03-01'),
  endDate: new Date('2026-03-03'),
});

const event = eventStore.get();
console.log(event?.startDate instanceof Date); // true
```

### Map Objects

```typescript
const settingsStore = createStore({
  key: 'settings',
  schema: z.object({
    preferences: z.map(z.string(), z.unknown()),
  }),
});

settingsStore.set({
  preferences: new Map([
    ['theme', 'dark'],
    ['language', 'en'],
    ['notifications', true],
  ]),
});

const settings = settingsStore.get();
console.log(settings?.preferences.get('theme')); // "dark"
```

### Set Objects

```typescript
const tagsStore = createStore({
  key: 'tags',
  schema: z.object({
    selected: z.set(z.string()),
  }),
});

tagsStore.set({
  selected: new Set(['javascript', 'typescript', 'react']),
});

const tags = tagsStore.get();
console.log(tags?.selected.has('typescript')); // true
```

## Error Handling

### Graceful Validation Failures

```typescript
const dataStore = createStore({
  key: 'data',
  schema: z.object({
    count: z.number(),
    name: z.string(),
  }),
  defaultValue: { count: 0, name: 'Default' },
  onValidationError: (error, key) => {
    console.error(`Validation error for ${key}:`, error);
    // Log to monitoring service
    logToSentry(error);
  },
});

// Even if localStorage has corrupted data, this won't crash
const data = dataStore.get(); // Returns defaultValue
```

### Custom Error Handling

```typescript
const safeStore = createStore({
  key: 'important-data',
  schema: z.object({ value: z.string() }),
  onValidationError: (error, key) => {
    // Custom recovery logic
    if (isRecoverableError(error)) {
      attemptRecovery(key);
    } else {
      notifyUser('Data corrupted, please re-enter');
    }
  },
});
```

## React Examples

### Form Auto-Save

```tsx
import { useSafeStorage } from 'safe-storage/react';

function ContactForm() {
  const [form, setForm] = useSafeStorage({
    key: 'contact-form-draft',
    schema: z.object({
      name: z.string(),
      email: z.string().email(),
      message: z.string(),
    }),
    defaultValue: { name: '', email: '', message: '' },
  });

  return (
    <form>
      <input
        value={form?.name}
        onChange={(e) => setForm({ ...form!, name: e.target.value })}
      />
      {/* Auto-saves on every change */}
    </form>
  );
}
```

### Authentication State

```tsx
const [user, setUser, { remove }] = useSafeStorage({
  key: 'auth-user',
  schema: z.object({
    id: z.string(),
    token: z.string(),
    name: z.string(),
  }),
});

// Login
function login(credentials) {
  const userData = await authenticate(credentials);
  setUser(userData);
}

// Logout
function logout() {
  remove();
}
```

## Vue Examples

### Persistent Filters

```vue
<script setup>
const { value: filters, set: setFilters } = useSafeStorage({
  key: 'table-filters',
  schema: z.object({
    search: z.string(),
    category: z.string(),
    sortBy: z.string(),
  }),
  defaultValue: { search: '', category: 'all', sortBy: 'name' },
});
</script>

<template>
  <input v-model="filters.search" placeholder="Search..." />
  <!-- Filters persist across page reloads -->
</template>
```

### Multi-Step Form

```vue
<script setup>
const { value: formStep, update: updateStep } = useSafeStorage({
  key: 'multi-step-form',
  schema: z.object({
    currentStep: z.number(),
    data: z.record(z.unknown()),
  }),
  defaultValue: { currentStep: 1, data: {} },
});

function nextStep(stepData) {
  updateStep((current) => ({
    currentStep: current!.currentStep + 1,
    data: { ...current!.data, ...stepData },
  }));
}
</script>
```

## Real-World Scenarios

### Shopping Cart

```typescript
const cartStore = createStore({
  key: 'shopping-cart',
  schema: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number(),
      price: z.number(),
    })
  ),
  defaultValue: [],
});

function addToCart(product) {
  cartStore.update((cart) => {
    const existing = cart!.find((item) => item.productId === product.id);
    if (existing) {
      return cart!.map((item) =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }
    return [...cart!, { productId: product.id, quantity: 1, price: product.price }];
  });
}
```

### User Preferences

```typescript
const prefsStore = createStore({
  key: 'user-preferences',
  schema: z.object({
    theme: z.enum(['light', 'dark', 'auto']),
    language: z.string(),
    notifications: z.object({
      email: z.boolean(),
      push: z.boolean(),
      sms: z.boolean(),
    }),
    privacy: z.object({
      shareData: z.boolean(),
      showProfile: z.boolean(),
    }),
  }),
  defaultValue: {
    theme: 'auto' as const,
    language: 'en',
    notifications: { email: true, push: true, sms: false },
    privacy: { shareData: false, showProfile: true },
  },
});
```

### Recent Searches

```typescript
const searchHistoryStore = createStore({
  key: 'search-history',
  schema: z.array(
    z.object({
      query: z.string(),
      timestamp: z.date(),
    })
  ),
  defaultValue: [],
  ttl: 1000 * 60 * 60 * 24 * 7, // 7 days
});

function addSearch(query) {
  searchHistoryStore.update((history) => [
    { query, timestamp: new Date() },
    ...(history || []).slice(0, 9), // Keep last 10
  ]);
}
```

### Draft Management

```typescript
const draftsStore = createStore({
  key: 'drafts',
  schema: z.record(
    z.string(),
    z.object({
      content: z.string(),
      lastSaved: z.date(),
    })
  ),
  defaultValue: {},
});

function saveDraft(id, content) {
  draftsStore.update((drafts) => ({
    ...drafts,
    [id]: { content, lastSaved: new Date() },
  }));
}
```

## Performance Tips

1. **Use `update()` for partial updates** instead of getting and setting

```typescript
// Good
store.update((current) => ({ ...current!, count: current!.count + 1 }));

// Less efficient
const current = store.get();
store.set({ ...current!, count: current!.count + 1 });
```

2. **Unsubscribe when components unmount**

```typescript
useEffect(() => {
  const unsubscribe = store.onUpdate(callback);
  return unsubscribe; // Clean up
}, []);
```

3. **Use session storage for temporary data**

```typescript
const tempStore = createStore({
  key: 'temp-data',
  schema: mySchema,
  storageType: 'session', // Cleared when tab closes
});
```
