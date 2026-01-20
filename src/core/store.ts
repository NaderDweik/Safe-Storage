import type {
  Store,
  StoreOptions,
  StoredData,
  UpdateCallback,
  ValidationResult,
} from '../types';
import { defaultSerializer } from './serializer';
import { debounce, throttle } from './debounce';

/**
 * Get the appropriate storage object
 */
function getStorage(type: 'local' | 'session'): Storage {
  if (typeof window === 'undefined') {
    throw new Error('SafeStorage can only be used in browser environments');
  }
  return type === 'local' ? window.localStorage : window.sessionStorage;
}

/**
 * Create a type-safe storage store
 */
export function createStore<T>(options: StoreOptions<T>): Store<T> {
  const {
    key,
    schema,
    storageType = 'local',
    version,
    migrate,
    ttl,
    defaultValue,
    onValidationError,
    serializer = defaultSerializer,
    debounce: debounceMs,
    throttle: throttleMs,
  } = options;

  const storage = getStorage(storageType);
  const updateCallbacks = new Set<UpdateCallback<T>>();

  /**
   * Validate data using the schema
   */
  function validate(data: unknown): T | null {
    try {
      // Try safeParse first (preferred for graceful handling)
      if (schema.safeParse) {
        const result = schema.safeParse(data) as ValidationResult<T>;
        if (result.success && result.data !== undefined) {
          return result.data;
        }
        if (onValidationError) {
          onValidationError(result.error, key);
        }
        return null;
      }

      // Fall back to parse (may throw)
      return schema.parse(data);
    } catch (error) {
      if (onValidationError) {
        onValidationError(error, key);
      }
      return null;
    }
  }

  /**
   * Check if data has expired
   */
  function isExpired(storedData: StoredData<T>): boolean {
    if (!storedData.expiresAt) {
      return false;
    }
    return Date.now() > storedData.expiresAt;
  }

  /**
   * Handle version migration
   */
  function migrateData(storedData: StoredData<T>): T | null {
    if (!version || !migrate) {
      return storedData.value;
    }

    // If stored version matches current version, no migration needed
    if (storedData.version === version) {
      return storedData.value;
    }

    // If stored version is newer, warn but don't migrate
    if (storedData.version && storedData.version > version) {
      console.warn(
        `SafeStorage: Stored data version (${storedData.version}) is newer than current version (${version}) for key "${key}"`
      );
      return storedData.value;
    }

    // Run migration
    try {
      return migrate(storedData.value);
    } catch (error) {
      console.error(`SafeStorage: Migration failed for key "${key}"`, error);
      if (onValidationError) {
        onValidationError(error, key);
      }
      return null;
    }
  }

  /**
   * Get value from storage
   */
  function get(): T | null {
    try {
      const raw = storage.getItem(key);
      if (!raw) {
        return defaultValue ?? null;
      }

      const storedData = serializer.deserialize(raw) as StoredData<T>;

      // Check expiration
      if (isExpired(storedData)) {
        storage.removeItem(key);
        return defaultValue ?? null;
      }

      // Handle migration
      let value = migrateData(storedData);
      if (value === null) {
        return defaultValue ?? null;
      }

      // Validate the data
      value = validate(value);
      if (value === null) {
        storage.removeItem(key);
        return defaultValue ?? null;
      }

      // If migration occurred, update storage with new version
      if (version && storedData.version !== version) {
        set(value);
      }

      return value;
    } catch (error) {
      console.error(`SafeStorage: Failed to get value for key "${key}"`, error);
      if (onValidationError) {
        onValidationError(error, key);
      }
      return defaultValue ?? null;
    }
  }

  /**
   * Internal set implementation
   */
  function _setInternal(data: T): void {
    try {
      // Validate before storing
      const validatedData = validate(data);
      if (validatedData === null) {
        throw new Error('Validation failed');
      }

      const storedData: StoredData<T> = {
        value: validatedData,
        version,
        timestamp: Date.now(),
      };

      // Add expiration if TTL is set
      if (ttl) {
        storedData.expiresAt = Date.now() + ttl;
      }

      const serialized = serializer.serialize(storedData);
      storage.setItem(key, serialized);

      // Notify local callbacks
      notifyCallbacks(validatedData);
    } catch (error) {
      console.error(`SafeStorage: Failed to set value for key "${key}"`, error);
      throw error;
    }
  }

  /**
   * Set value in storage (with optional debounce/throttle)
   */
  const set: (data: T) => void =
    debounceMs
      ? debounce(_setInternal as (...args: unknown[]) => void, debounceMs) as (data: T) => void
      : throttleMs
      ? throttle(_setInternal as (...args: unknown[]) => void, throttleMs) as (data: T) => void
      : _setInternal;

  /**
   * Update value using an updater function
   */
  function update(fn: (current: T | null) => T): void {
    const current = get();
    const newValue = fn(current);
    set(newValue);
  }

  /**
   * Remove value from storage
   */
  function remove(): void {
    storage.removeItem(key);
    notifyCallbacks(null);
  }

  /**
   * Check if valid data exists
   */
  function has(): boolean {
    return get() !== null;
  }

  /**
   * Get raw stored data (for debugging)
   */
  function getRaw(): StoredData<T> | null {
    try {
      const raw = storage.getItem(key);
      if (!raw) {
        return null;
      }
      return serializer.deserialize(raw) as StoredData<T>;
    } catch {
      return null;
    }
  }

  /**
   * Notify all update callbacks
   */
  function notifyCallbacks(value: T | null): void {
    updateCallbacks.forEach((callback) => {
      try {
        callback(value);
      } catch (error) {
        console.error('SafeStorage: Update callback error', error);
      }
    });
  }

  /**
   * Handle storage events from other tabs
   */
  function handleStorageEvent(event: StorageEvent): void {
    // Only process events for this key
    if (event.key !== key) {
      return;
    }

    // If the storage was cleared or removed
    if (event.newValue === null) {
      notifyCallbacks(null);
      return;
    }

    // Parse and validate the new value
    try {
      const storedData = serializer.deserialize(event.newValue) as StoredData<T>;
      
      if (isExpired(storedData)) {
        notifyCallbacks(null);
        return;
      }

      let value = migrateData(storedData);
      if (value !== null) {
        value = validate(value);
        if (value !== null) {
          notifyCallbacks(value);
        }
      }
    } catch (error) {
      console.error(`SafeStorage: Failed to handle storage event for key "${key}"`, error);
    }
  }

  /**
   * Subscribe to updates
   */
  function onUpdate(callback: UpdateCallback<T>): () => void {
    updateCallbacks.add(callback);

    // Set up storage event listener for cross-tab sync
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageEvent);
    }

    // Return unsubscribe function
    return () => {
      updateCallbacks.delete(callback);
      
      // Remove event listener if no more callbacks
      if (updateCallbacks.size === 0 && typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageEvent);
      }
    };
  }

  return {
    get,
    set,
    update,
    remove,
    onUpdate,
    has,
    getRaw,
  };
}
