/**
 * Advanced example demonstrating migrations, TTL, and complex types
 */

import { z } from 'zod';
import { createStore } from '../src';

// Example 1: Version Migrations
console.log('=== Example 1: Version Migrations ===');

// Imagine we're migrating from v1 to v2
// v1: { name: string }
// v2: { firstName: string, lastName: string }

const userSchemaV2 = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
});

const userStoreV2 = createStore({
  key: 'user-profile',
  schema: userSchemaV2,
  version: 2,
  migrate: (oldData) => {
    const old = oldData as { name: string; email: string };
    const nameParts = old.name.split(' ');
    return {
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: old.email,
    };
  },
});

// Example 2: TTL (Time-To-Live)
console.log('\n=== Example 2: TTL ===');

const sessionSchema = z.object({
  token: z.string(),
  userId: z.string(),
});

const sessionStore = createStore({
  key: 'session',
  schema: sessionSchema,
  ttl: 1000 * 60 * 30, // 30 minutes
  onValidationError: (error, key) => {
    console.error(`Session validation failed for ${key}:`, error);
  },
});

sessionStore.set({
  token: 'abc123xyz',
  userId: 'user-456',
});

console.log('Session stored:', sessionStore.get());
console.log('Session will expire in 30 minutes');

// Example 3: Complex Types (Date, Map, Set)
console.log('\n=== Example 3: Complex Types ===');

const dataSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  tags: z.set(z.string()),
  metadata: z.map(z.string(), z.string()),
});

const dataStore = createStore({
  key: 'complex-data',
  schema: dataSchema,
});

dataStore.set({
  id: 'data-1',
  createdAt: new Date(),
  tags: new Set(['typescript', 'react', 'storage']),
  metadata: new Map([
    ['author', 'John Doe'],
    ['version', '1.0.0'],
  ]),
});

const data = dataStore.get();
if (data) {
  console.log('Created at:', data.createdAt.toISOString());
  console.log('Tags:', Array.from(data.tags));
  console.log('Metadata:', Object.fromEntries(data.metadata));
  console.log('Is Date?', data.createdAt instanceof Date);
  console.log('Is Set?', data.tags instanceof Set);
  console.log('Is Map?', data.metadata instanceof Map);
}

// Example 4: Graceful Error Handling
console.log('\n=== Example 4: Graceful Error Handling ===');

const safeStore = createStore({
  key: 'safe-data',
  schema: z.object({
    count: z.number(),
  }),
  defaultValue: { count: 0 },
  onValidationError: (error, key) => {
    console.warn(`Data validation failed for ${key}, using default value`);
    console.error(error);
  },
});

// Even if localStorage has corrupted data, get() won't crash
const safeData = safeStore.get();
console.log('Safe data:', safeData); // { count: 0 }

// Example 5: Cross-Tab Sync
console.log('\n=== Example 5: Cross-Tab Sync ===');

const themeSchema = z.enum(['light', 'dark', 'auto']);

const themeStore = createStore({
  key: 'app-theme',
  schema: themeSchema,
  defaultValue: 'light' as const,
});

// Listen for changes from other tabs
themeStore.onUpdate((newTheme) => {
  console.log('Theme changed (possibly from another tab):', newTheme);
  document.body.setAttribute('data-theme', newTheme || 'light');
});

themeStore.set('dark');

// Example 6: Multiple Stores
console.log('\n=== Example 6: Multiple Stores ===');

// User preferences
const preferencesStore = createStore({
  key: 'preferences',
  schema: z.object({
    language: z.string(),
    timezone: z.string(),
    theme: z.enum(['light', 'dark']),
  }),
  defaultValue: {
    language: 'en',
    timezone: 'UTC',
    theme: 'light' as const,
  },
});

// Cart items
const cartStore = createStore({
  key: 'cart',
  schema: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      quantity: z.number(),
      price: z.number(),
    })
  ),
  defaultValue: [],
});

preferencesStore.set({
  language: 'en',
  timezone: 'America/New_York',
  theme: 'dark',
});

cartStore.set([
  { id: '1', name: 'Product A', quantity: 2, price: 29.99 },
  { id: '2', name: 'Product B', quantity: 1, price: 49.99 },
]);

console.log('Preferences:', preferencesStore.get());
console.log('Cart items:', cartStore.get());
