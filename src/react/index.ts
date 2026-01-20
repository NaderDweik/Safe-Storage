import { useEffect, useState, useCallback, useRef } from 'react';
import { createStore } from '../core/store';
import type { StoreOptions, Store } from '../types';

// Export Suspense hooks
export {
  useSafeStorageSuspense,
  preloadStorage,
  clearResourceCache,
} from './suspense';

/**
 * React hook for type-safe storage with schema validation
 * 
 * @example
 * ```tsx
 * import { z } from 'zod';
 * import { useSafeStorage } from 'safe-storage/react';
 * 
 * const userSchema = z.object({
 *   name: z.string(),
 *   age: z.number(),
 * });
 * 
 * function App() {
 *   const [user, setUser, { remove, isLoading }] = useSafeStorage({
 *     key: 'user',
 *     schema: userSchema,
 *   });
 * 
 *   return (
 *     <div>
 *       {user && <p>Hello, {user.name}!</p>}
 *       <button onClick={() => setUser({ name: 'John', age: 30 })}>
 *         Set User
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSafeStorage<T>(
  options: StoreOptions<T>
): [
  T | null,
  (data: T) => void,
  {
    remove: () => void;
    update: (fn: (current: T | null) => T) => void;
    isLoading: boolean;
    store: Store<T>;
  }
] {
  const [value, setValue] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const storeRef = useRef<Store<T>>();

  // Create store instance (only once)
  if (!storeRef.current) {
    storeRef.current = createStore(options);
  }

  const store = storeRef.current;

  // Initialize value from storage
  useEffect(() => {
    const initialValue = store.get();
    setValue(initialValue);
    setIsLoading(false);
  }, [store]);

  // Subscribe to updates (including cross-tab)
  useEffect(() => {
    const unsubscribe = store.onUpdate((newValue) => {
      setValue(newValue);
    });

    return unsubscribe;
  }, [store]);

  // Memoized setters
  const set = useCallback(
    (data: T) => {
      store.set(data);
      setValue(data);
    },
    [store]
  );

  const update = useCallback(
    (fn: (current: T | null) => T) => {
      store.update(fn);
      setValue(store.get());
    },
    [store]
  );

  const remove = useCallback(() => {
    store.remove();
    setValue(null);
  }, [store]);

  return [
    value,
    set,
    {
      remove,
      update,
      isLoading,
      store,
    },
  ];
}

/**
 * Create a reusable storage hook with predefined options
 * 
 * @example
 * ```tsx
 * import { z } from 'zod';
 * import { createStorageHook } from 'safe-storage/react';
 * 
 * const userSchema = z.object({
 *   name: z.string(),
 *   age: z.number(),
 * });
 * 
 * export const useUserStorage = createStorageHook({
 *   key: 'user',
 *   schema: userSchema,
 *   defaultValue: { name: 'Guest', age: 0 },
 * });
 * 
 * // In your component
 * function Profile() {
 *   const [user, setUser] = useUserStorage();
 *   // ...
 * }
 * ```
 */
export function createStorageHook<T>(options: StoreOptions<T>) {
  return () => useSafeStorage(options);
}
