/**
 * Basic example using SafeStorage with Zod in vanilla TypeScript
 */

import { z } from 'zod';
import { createStore } from '../src';

// Define your data schema
const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  age: z.number().min(0),
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    notifications: z.boolean(),
  }),
});

type User = z.infer<typeof userSchema>;

// Create a type-safe store
const userStore = createStore({
  key: 'user',
  schema: userSchema,
  storageType: 'local',
});

// Example usage
function example() {
  // Set user data
  userStore.set({
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    preferences: {
      theme: 'dark',
      notifications: true,
    },
  });

  // Get user data (type-safe)
  const user = userStore.get();
  if (user) {
    console.log(`Welcome, ${user.name}!`);
    console.log(`Theme: ${user.preferences.theme}`);
  }

  // Update user data
  userStore.update((current) => {
    if (!current) return null as unknown as User;
    return {
      ...current,
      age: current.age + 1,
    };
  });

  // Subscribe to changes (including cross-tab)
  const unsubscribe = userStore.onUpdate((newUser) => {
    console.log('User updated:', newUser);
  });

  // Later: unsubscribe
  unsubscribe();

  // Remove user data
  userStore.remove();
}

example();
