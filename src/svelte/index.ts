/**
 * Svelte stores integration for SafeStorage
 */

import { writable, derived, type Writable, type Readable } from 'svelte/store';
import { createStore } from '../core/store';
import type { StoreOptions, Store } from '../types';

/**
 * Create a Svelte writable store backed by SafeStorage
 * 
 * @example
 * ```typescript
 * import { z } from 'zod';
 * import { safeStorageStore } from 'safe-storage/svelte';
 * 
 * const userSchema = z.object({
 *   name: z.string(),
 *   email: z.string().email(),
 * });
 * 
 * export const user = safeStorageStore({
 *   key: 'user',
 *   schema: userSchema,
 * });
 * 
 * // In your Svelte component:
 * // <script>
 * //   import { user } from './stores';
 * // </script>
 * // <p>Hello, {$user?.name}!</p>
 * ```
 */
export function safeStorageStore<T>(
  options: StoreOptions<T>
): Writable<T | null> & { store: Store<T> } {
  const safeStore = createStore(options);
  const initialValue = safeStore.get();
  
  const { subscribe, set, update } = writable<T | null>(initialValue);

  // Subscribe to SafeStorage updates (including cross-tab)
  const unsubscribe = safeStore.onUpdate((newValue) => {
    set(newValue);
  });

  // Override set to also update SafeStorage
  const customSet = (value: T | null) => {
    if (value !== null) {
      safeStore.set(value);
    } else {
      safeStore.remove();
    }
    set(value);
  };

  // Override update to also update SafeStorage
  const customUpdate = (fn: (value: T | null) => T | null) => {
    update((currentValue: T | null) => {
      const newValue = fn(currentValue);
      if (newValue !== null) {
        safeStore.set(newValue);
      } else {
        safeStore.remove();
      }
      return newValue;
    });
  };

  // Clean up on module unload (Svelte handles this)
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', unsubscribe);
  }

  return {
    subscribe,
    set: customSet,
    update: customUpdate,
    store: safeStore,
  };
}

/**
 * Create a derived Svelte store with SafeStorage
 * 
 * @example
 * ```typescript
 * const count = safeStorageStore({
 *   key: 'count',
 *   schema: z.number(),
 *   defaultValue: 0,
 * });
 * 
 * const doubled = derivedSafeStorage(count, $count => ($count || 0) * 2);
 * ```
 */
export function derivedSafeStorage<T, S>(
  store: Readable<T>,
  fn: (value: T) => S
): Readable<S> {
  return derived(store, fn);
}

/**
 * Create a readable Svelte store (read-only)
 */
export function readableSafeStorage<T>(
  options: StoreOptions<T>
): Readable<T | null> & { store: Store<T> } {
  const safeStore = createStore(options);
  const initialValue = safeStore.get();
  
  const { subscribe } = writable<T | null>(initialValue, (set: (value: T | null) => void) => {
    // Subscribe to updates
    const unsubscribe = safeStore.onUpdate((newValue) => {
      set(newValue);
    });

    return unsubscribe;
  });

  return {
    subscribe,
    store: safeStore,
  };
}
