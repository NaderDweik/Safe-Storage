/**
 * React Suspense integration for SafeStorage
 */

import { createStore } from '../core/store';
import type { StoreOptions, Store } from '../types';

type SuspenseStatus = 'pending' | 'success' | 'error';

interface Resource<T> {
  read: () => T | null;
  store: Store<T>;
}

/**
 * Create a Suspense-compatible resource
 */
function createResource<T>(options: StoreOptions<T>): Resource<T> {
  const store = createStore(options);
  let status: SuspenseStatus = 'pending';
  let result: T | null = null;
  let error: Error | null = null;
  let suspender: Promise<void> | null = null;

  // Initialize asynchronously
  suspender = Promise.resolve().then(() => {
    try {
      result = store.get();
      status = 'success';
    } catch (e) {
      error = e instanceof Error ? e : new Error(String(e));
      status = 'error';
    }
  });

  return {
    read(): T | null {
      switch (status) {
        case 'pending':
          throw suspender;
        case 'error':
          throw error;
        case 'success':
          return result;
      }
    },
    store,
  };
}

/**
 * React hook for Suspense-enabled storage
 * 
 * @example
 * ```tsx
 * import { Suspense } from 'react';
 * import { useSafeStorageSuspense } from 'safe-storage/react';
 * 
 * function UserProfile() {
 *   const user = useSafeStorageSuspense({
 *     key: 'user',
 *     schema: userSchema,
 *   });
 * 
 *   return <div>{user?.name}</div>;
 * }
 * 
 * function App() {
 *   return (
 *     <Suspense fallback={<div>Loading...</div>}>
 *       <UserProfile />
 *     </Suspense>
 *   );
 * }
 * ```
 */
export function useSafeStorageSuspense<T>(
  options: StoreOptions<T>
): T | null {
  // Store resource in a ref-like manner (using module-level cache)
  const resource = getOrCreateResource(options);
  return resource.read();
}

// Simple cache for resources (keyed by storage key)
const resourceCache = new Map<string, Resource<unknown>>();

function getOrCreateResource<T>(options: StoreOptions<T>): Resource<T> {
  const existing = resourceCache.get(options.key);
  if (existing) {
    return existing as Resource<T>;
  }

  const resource = createResource(options);
  resourceCache.set(options.key, resource as Resource<unknown>);
  return resource;
}

/**
 * Preload data for Suspense (optional optimization)
 */
export function preloadStorage<T>(options: StoreOptions<T>): void {
  getOrCreateResource(options);
}

/**
 * Clear the resource cache (useful for testing)
 */
export function clearResourceCache(): void {
  resourceCache.clear();
}
