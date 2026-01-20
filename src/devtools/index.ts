/**
 * DevTools integration for SafeStorage
 * Enables visual debugging and inspection
 */

import type { Store } from '../types';

export interface DevToolsConfig {
  enabled?: boolean;
  name?: string;
  maxHistory?: number;
}

interface StoreRegistry {
  [key: string]: {
    store: Store<unknown>;
    history: Array<{
      action: string;
      value: unknown;
      timestamp: number;
    }>;
  };
}

interface SafeStorageDevTools {
  stores: StoreRegistry;
  getStore: (key: string) => Store<unknown> | undefined;
  getAllStores: () => string[];
  getHistory: (key: string) => unknown[];
  clearHistory: (key: string) => void;
  clearAll: () => void;
  inspect: (key: string) => unknown;
  export: () => string;
  import: (data: string) => void;
}

// Global registry
const storeRegistry: StoreRegistry = {};
const maxHistorySize = 50;

/**
 * Register a store with DevTools
 */
export function registerStore<T>(
  key: string,
  store: Store<T>,
  config: DevToolsConfig = {}
): void {
  const { enabled = true } = config;

  if (!enabled || typeof window === 'undefined') {
    return;
  }

  storeRegistry[key] = {
    store: store as Store<unknown>,
    history: [],
  };

  // Track changes
  store.onUpdate((value) => {
    if (storeRegistry[key]) {
      storeRegistry[key].history.push({
        action: 'update',
        value,
        timestamp: Date.now(),
      });

      // Keep history size limited
      if (storeRegistry[key].history.length > maxHistorySize) {
        storeRegistry[key].history.shift();
      }

      // Notify DevTools extension if present
      notifyDevTools(key, 'update', value);
    }
  });

  // Initialize DevTools
  initializeDevTools();
}

/**
 * Initialize DevTools on window object
 */
function initializeDevTools(): void {
  if (typeof window === 'undefined') return;

  if (!(window as any).__SAFE_STORAGE_DEVTOOLS__) {
    (window as any).__SAFE_STORAGE_DEVTOOLS__ = createDevTools();
    
    // Log initialization
    if (process.env.NODE_ENV === 'development') {
      console.log(
        '%c[SafeStorage DevTools]%c Initialized. Use window.__SAFE_STORAGE_DEVTOOLS__ to inspect.',
        'color: #00A67E; font-weight: bold',
        'color: inherit'
      );
    }
  }
}

/**
 * Create DevTools interface
 */
function createDevTools(): SafeStorageDevTools {
  return {
    stores: storeRegistry,

    getStore(key: string) {
      return storeRegistry[key]?.store;
    },

    getAllStores() {
      return Object.keys(storeRegistry);
    },

    getHistory(key: string) {
      return storeRegistry[key]?.history || [];
    },

    clearHistory(key: string) {
      if (storeRegistry[key]) {
        storeRegistry[key].history = [];
      }
    },

    clearAll() {
      Object.keys(storeRegistry).forEach((key) => {
        storeRegistry[key].store.remove();
      });
    },

    inspect(key: string) {
      const entry = storeRegistry[key];
      if (!entry) {
        console.warn(`Store "${key}" not found`);
        return null;
      }

      const data = {
        key,
        currentValue: entry.store.get(),
        raw: entry.store.getRaw(),
        history: entry.history,
        hasValue: entry.store.has(),
      };

      console.table(data);
      return data;
    },

    export() {
      const data: Record<string, unknown> = {};
      Object.keys(storeRegistry).forEach((key) => {
        data[key] = storeRegistry[key].store.get();
      });
      return JSON.stringify(data, null, 2);
    },

    import(jsonData: string) {
      try {
        const data = JSON.parse(jsonData);
        Object.keys(data).forEach((key) => {
          const store = storeRegistry[key]?.store;
          if (store && data[key] !== null) {
            store.set(data[key]);
          }
        });
        console.log('✓ Data imported successfully');
      } catch (error) {
        console.error('Failed to import data:', error);
      }
    },
  };
}

/**
 * Notify DevTools extension (if installed)
 */
function notifyDevTools(key: string, action: string, value: unknown): void {
  if (typeof window === 'undefined') return;

  window.postMessage(
    {
      type: 'SAFE_STORAGE_UPDATE',
      payload: { key, action, value, timestamp: Date.now() },
    },
    '*'
  );
}

/**
 * Log store operations (development only)
 */
export function enableLogging(): void {
  if (process.env.NODE_ENV !== 'development') return;

  Object.keys(storeRegistry).forEach((key) => {
    const store = storeRegistry[key].store;
    store.onUpdate((value) => {
      console.log(
        `%c[SafeStorage]%c ${key}`,
        'color: #00A67E; font-weight: bold',
        'color: #666',
        value
      );
    });
  });
}
