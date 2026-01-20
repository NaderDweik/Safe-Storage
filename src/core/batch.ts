/**
 * Batch operations for better performance
 */

import type { StorageType } from '../types';

/**
 * Get storage instance
 */
function getStorage(type: StorageType): Storage {
  if (typeof window === 'undefined') {
    throw new Error('Batch operations can only be used in browser environments');
  }
  return type === 'local' ? window.localStorage : window.sessionStorage;
}

/**
 * Batch set multiple items
 */
export function batchSet(
  items: Array<{ key: string; value: string }>,
  storageType: StorageType = 'local'
): void {
  const storage = getStorage(storageType);
  
  for (const { key, value } of items) {
    storage.setItem(key, value);
  }
}

/**
 * Batch get multiple items
 */
export function batchGet(
  keys: string[],
  storageType: StorageType = 'local'
): Array<{ key: string; value: string | null }> {
  const storage = getStorage(storageType);
  
  return keys.map(key => ({
    key,
    value: storage.getItem(key),
  }));
}

/**
 * Batch remove multiple items
 */
export function batchRemove(
  keys: string[],
  storageType: StorageType = 'local'
): void {
  const storage = getStorage(storageType);
  
  for (const key of keys) {
    storage.removeItem(key);
  }
}

/**
 * Clear all items with optional prefix filter
 */
export function clearWithPrefix(
  prefix: string,
  storageType: StorageType = 'local'
): number {
  const storage = getStorage(storageType);
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key && key.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }
  
  batchRemove(keysToRemove, storageType);
  return keysToRemove.length;
}

/**
 * Get all keys with optional prefix filter
 */
export function getAllKeys(
  prefix?: string,
  storageType: StorageType = 'local'
): string[] {
  const storage = getStorage(storageType);
  const keys: string[] = [];
  
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key && (!prefix || key.startsWith(prefix))) {
      keys.push(key);
    }
  }
  
  return keys;
}

/**
 * Batch operation with transaction-like behavior
 * If any operation fails, all are rolled back
 */
export function batchTransaction(
  operations: Array<{ type: 'set' | 'remove'; key: string; value?: string }>,
  storageType: StorageType = 'local'
): { success: boolean; error?: Error } {
  const storage = getStorage(storageType);
  const backup = new Map<string, string | null>();
  
  try {
    // Backup current state
    for (const op of operations) {
      backup.set(op.key, storage.getItem(op.key));
    }
    
    // Execute operations
    for (const op of operations) {
      if (op.type === 'set' && op.value !== undefined) {
        storage.setItem(op.key, op.value);
      } else if (op.type === 'remove') {
        storage.removeItem(op.key);
      }
    }
    
    return { success: true };
  } catch (error) {
    // Rollback on error
    for (const [key, value] of backup) {
      if (value === null) {
        storage.removeItem(key);
      } else {
        storage.setItem(key, value);
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}
