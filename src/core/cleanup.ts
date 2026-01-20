/**
 * Storage cleanup utilities
 */

import type { StorageType } from '../types';

export interface CleanupOptions {
  /**
   * Maximum age in milliseconds
   */
  maxAge?: number;

  /**
   * Maximum number of items to keep
   */
  maxItems?: number;

  /**
   * Strategy for cleanup when maxItems is reached
   */
  strategy?: 'lru' | 'fifo' | 'oldest';

  /**
   * Key prefix to filter items
   */
  prefix?: string;

  /**
   * Storage type
   */
  storageType?: StorageType;

  /**
   * Dry run - don't actually delete
   */
  dryRun?: boolean;
}

interface StorageItem {
  key: string;
  value: string;
  timestamp: number;
  lastAccessed?: number;
  size: number;
}

/**
 * Get storage instance
 */
function getStorage(type: StorageType): Storage {
  if (typeof window === 'undefined') {
    throw new Error('Cleanup can only be used in browser environments');
  }
  return type === 'local' ? window.localStorage : window.sessionStorage;
}

/**
 * Parse stored data to get timestamp
 */
function parseStoredData(value: string): { timestamp?: number; lastAccessed?: number } {
  try {
    const parsed = JSON.parse(value);
    return {
      timestamp: parsed.timestamp,
      lastAccessed: parsed.lastAccessed,
    };
  } catch {
    return {};
  }
}

/**
 * Get all items from storage
 */
function getAllItems(
  storage: Storage,
  prefix?: string
): StorageItem[] {
  const items: StorageItem[] = [];

  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key || (prefix && !key.startsWith(prefix))) {
      continue;
    }

    const value = storage.getItem(key);
    if (!value) continue;

    const { timestamp, lastAccessed } = parseStoredData(value);
    const size = new Blob([key + value]).size;

    items.push({
      key,
      value,
      timestamp: timestamp || 0,
      lastAccessed: lastAccessed || timestamp || 0,
      size,
    });
  }

  return items;
}

/**
 * Clean up old storage items
 */
export function cleanupStorage(options: CleanupOptions = {}): {
  removed: number;
  keys: string[];
  freedSpace: number;
} {
  const {
    maxAge,
    maxItems,
    strategy = 'lru',
    prefix,
    storageType = 'local',
    dryRun = false,
  } = options;

  const storage = getStorage(storageType);
  const items = getAllItems(storage, prefix);
  const now = Date.now();
  const keysToRemove: string[] = [];
  let freedSpace = 0;

  // Remove items older than maxAge
  if (maxAge) {
    items.forEach((item) => {
      if (typeof item.timestamp === 'number' && now - item.timestamp > maxAge) {
        keysToRemove.push(item.key);
        freedSpace += item.size;
      }
    });
  }

  // Remove excess items if maxItems is set
  if (maxItems && items.length > maxItems) {
    // Sort based on strategy
    const sortedItems = [...items].sort((a, b) => {
      switch (strategy) {
        case 'lru':
          return (a.lastAccessed || 0) - (b.lastAccessed || 0);
        case 'fifo':
        case 'oldest':
          return a.timestamp - b.timestamp;
        default:
          return 0;
      }
    });

    // Remove oldest items
    const itemsToRemove = sortedItems.slice(0, items.length - maxItems);
    itemsToRemove.forEach((item) => {
      if (!keysToRemove.includes(item.key)) {
        keysToRemove.push(item.key);
        freedSpace += item.size;
      }
    });
  }

  // Actually remove items
  if (!dryRun) {
    keysToRemove.forEach((key) => {
      storage.removeItem(key);
    });
  }

  return {
    removed: keysToRemove.length,
    keys: keysToRemove,
    freedSpace,
  };
}

/**
 * Schedule automatic cleanup
 */
export function scheduleCleanup(
  options: CleanupOptions & { interval: number }
): () => void {
  const { interval, ...cleanupOptions } = options;

  const intervalId = setInterval(() => {
    const result = cleanupStorage(cleanupOptions);
    if (result.removed > 0) {
      console.log(
        `[SafeStorage] Cleaned up ${result.removed} items, freed ${(result.freedSpace / 1024).toFixed(2)} KB`
      );
    }
  }, interval);

  // Return cleanup function
  return () => clearInterval(intervalId);
}

/**
 * Get storage statistics
 */
export function getStorageStats(
  prefix?: string,
  storageType: StorageType = 'local'
): {
  totalItems: number;
  totalSize: number;
  oldestItem: number;
  newestItem: number;
  averageSize: number;
} {
  const storage = getStorage(storageType);
  const items = getAllItems(storage, prefix);

  if (items.length === 0) {
    return {
      totalItems: 0,
      totalSize: 0,
      oldestItem: 0,
      newestItem: 0,
      averageSize: 0,
    };
  }

  const totalSize = items.reduce((sum, item) => sum + item.size, 0);
  const timestamps = items
    .map((item) => item.timestamp)
    .filter((t) => t > 0);

  return {
    totalItems: items.length,
    totalSize,
    oldestItem: timestamps.length > 0 ? Math.min(...timestamps) : 0,
    newestItem: timestamps.length > 0 ? Math.max(...timestamps) : 0,
    averageSize: totalSize / items.length,
  };
}
