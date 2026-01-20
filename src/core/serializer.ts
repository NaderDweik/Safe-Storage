import type { Serializer } from '../types';

/**
 * Custom JSON replacer that handles Date, Map, Set, and other special types
 * Uses 'this' context to access original values before toJSON() is called
 */
function replacer(this: any, key: string, value: unknown): unknown {
  // Get the original value from 'this' context to bypass toJSON()
  const originalValue = key ? this[key] : value;

  // Handle Date objects (check original value to bypass toJSON)
  if (originalValue instanceof Date) {
    return {
      __type: 'Date',
      value: originalValue.toISOString(),
    };
  }

  // Handle Map objects
  if (originalValue instanceof Map) {
    return {
      __type: 'Map',
      value: Array.from(originalValue.entries()),
    };
  }

  // Handle Set objects
  if (originalValue instanceof Set) {
    return {
      __type: 'Set',
      value: Array.from(originalValue),
    };
  }

  // Handle undefined (JSON.stringify skips undefined by default)
  if (originalValue === undefined) {
    return {
      __type: 'undefined',
    };
  }

  return value;
}

/**
 * Custom JSON reviver that restores Date, Map, Set, and other special types
 */
function reviver(_key: string, value: unknown): unknown {
  if (typeof value === 'object' && value !== null && '__type' in value) {
    const typed = value as { __type: string; value?: unknown };

    switch (typed.__type) {
      case 'Date':
        return new Date(typed.value as string);

      case 'Map':
        return new Map(typed.value as Array<[unknown, unknown]>);

      case 'Set':
        return new Set(typed.value as Array<unknown>);

      case 'undefined':
        return undefined;

      default:
        return value;
    }
  }

  return value;
}

/**
 * Default serializer implementation with smart serialization
 */
export const defaultSerializer: Serializer = {
  serialize(data: unknown): string {
    // Wrap the data to ensure top-level special types are handled
    // Date.toJSON() is called before replacer sees it, so we need this wrapper
    const wrapped = { __root: data };
    const stringified = JSON.stringify(wrapped, replacer);
    return stringified;
  },

  deserialize(data: string): unknown {
    try {
      const parsed = JSON.parse(data, reviver);
      // Unwrap the root value
      return parsed && typeof parsed === 'object' && '__root' in parsed
        ? parsed.__root
        : parsed;
    } catch {
      throw new Error('Failed to deserialize data');
    }
  },
};
