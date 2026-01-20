import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import { createStore } from '../core/store';
import type { StoreOptions, Store } from '../types';

/**
 * Vue composable for type-safe storage with schema validation
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { z } from 'zod';
 * import { useSafeStorage } from 'safe-storage/vue';
 * 
 * const userSchema = z.object({
 *   name: z.string(),
 *   age: z.number(),
 * });
 * 
 * const { value: user, set, remove, isLoading } = useSafeStorage({
 *   key: 'user',
 *   schema: userSchema,
 * });
 * 
 * function updateUser() {
 *   set({ name: 'John', age: 30 });
 * }
 * </script>
 * 
 * <template>
 *   <div>
 *     <p v-if="user">Hello, {{ user.name }}!</p>
 *     <button @click="updateUser">Set User</button>
 *   </div>
 * </template>
 * ```
 */
export function useSafeStorage<T>(options: StoreOptions<T>) {
  const value: Ref<T | null> = ref(null);
  const isLoading = ref(true);
  
  let store: Store<T>;
  let unsubscribe: (() => void) | undefined;

  onMounted(() => {
    // Create store instance
    store = createStore(options);

    // Load initial value
    value.value = store.get();
    isLoading.value = false;

    // Subscribe to updates (including cross-tab)
    unsubscribe = store.onUpdate((newValue) => {
      value.value = newValue;
    });
  });

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  const set = (data: T) => {
    store.set(data);
    value.value = data;
  };

  const update = (fn: (current: T | null) => T) => {
    store.update(fn);
    value.value = store.get();
  };

  const remove = () => {
    store.remove();
    value.value = null;
  };

  const has = () => {
    return store.has();
  };

  return {
    value,
    set,
    update,
    remove,
    has,
    isLoading,
    store: store!,
  };
}

/**
 * Create a reusable storage composable with predefined options
 * 
 * @example
 * ```ts
 * import { z } from 'zod';
 * import { createStorageComposable } from 'safe-storage/vue';
 * 
 * const userSchema = z.object({
 *   name: z.string(),
 *   age: z.number(),
 * });
 * 
 * export const useUserStorage = createStorageComposable({
 *   key: 'user',
 *   schema: userSchema,
 *   defaultValue: { name: 'Guest', age: 0 },
 * });
 * 
 * // In your component
 * const { value: user, set } = useUserStorage();
 * ```
 */
export function createStorageComposable<T>(options: StoreOptions<T>) {
  return () => useSafeStorage(options);
}
