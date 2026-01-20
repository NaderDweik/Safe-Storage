/**
 * Core store tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createStore } from './store';
import { z } from 'zod';

describe('createStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Basic Operations', () => {
    it('should store and retrieve data', () => {
      const store = createStore({
        key: 'test',
        schema: z.object({ name: z.string() }),
      });

      store.set({ name: 'John' });
      expect(store.get()).toEqual({ name: 'John' });
    });

    it('should return null when no data exists', () => {
      const store = createStore({
        key: 'test',
        schema: z.object({ name: z.string() }),
      });

      expect(store.get()).toBeNull();
    });

    it('should return default value when no data exists', () => {
      const store = createStore({
        key: 'test',
        schema: z.object({ name: z.string() }),
        defaultValue: { name: 'Default' },
      });

      expect(store.get()).toEqual({ name: 'Default' });
    });

    it('should remove data', () => {
      const store = createStore({
        key: 'test',
        schema: z.object({ name: z.string() }),
      });

      store.set({ name: 'John' });
      store.remove();
      expect(store.get()).toBeNull();
    });

    it('should update data', () => {
      const store = createStore({
        key: 'test',
        schema: z.object({ count: z.number() }),
        defaultValue: { count: 0 },
      });

      store.update((current) => ({ count: (current?.count || 0) + 1 }));
      expect(store.get()).toEqual({ count: 1 });
    });

    it('should check if data exists', () => {
      const store = createStore({
        key: 'test',
        schema: z.object({ name: z.string() }),
      });

      expect(store.has()).toBe(false);
      store.set({ name: 'John' });
      expect(store.has()).toBe(true);
    });
  });

  describe('Schema Validation', () => {
    it('should validate data on set', () => {
      const store = createStore({
        key: 'test',
        schema: z.object({
          age: z.number().min(0).max(150),
        }),
      });

      expect(() => store.set({ age: 30 })).not.toThrow();
    });

    it('should reject invalid data', () => {
      const store = createStore({
        key: 'test',
        schema: z.object({
          age: z.number().min(0).max(150),
        }),
      });

      expect(() => store.set({ age: 200 } as any)).toThrow();
    });

    it('should handle corrupted data gracefully', () => {
      const store = createStore({
        key: 'test',
        schema: z.object({ name: z.string() }),
        defaultValue: { name: 'Fallback' },
      });

      // Manually corrupt data
      localStorage.setItem('test', 'invalid-json');

      expect(store.get()).toEqual({ name: 'Fallback' });
    });

    it('should call onValidationError on failure', () => {
      const onError = vi.fn();
      const store = createStore({
        key: 'test',
        schema: z.object({ name: z.string() }),
        onValidationError: onError,
      });

      // Manually set invalid data
      localStorage.setItem(
        'test',
        JSON.stringify({ value: { name: 123 }, version: 1 })
      );

      store.get();
      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Storage Types', () => {
    it('should use localStorage by default', () => {
      const store = createStore({
        key: 'test',
        schema: z.string(),
      });

      store.set('value');
      expect(localStorage.getItem('test')).toBeTruthy();
    });

    it('should use sessionStorage when specified', () => {
      const store = createStore({
        key: 'test',
        schema: z.string(),
        storageType: 'session',
      });

      store.set('value');
      expect(sessionStorage.getItem('test')).toBeTruthy();
      expect(localStorage.getItem('test')).toBeNull();
    });
  });

  describe('Version Migrations', () => {
    it('should migrate data to new version', () => {
      // Set v1 data
      const oldData = { value: { name: 'John Doe' }, version: 1 };
      localStorage.setItem('test', JSON.stringify(oldData));

      // Create v2 store with migration
      const store = createStore({
        key: 'test',
        schema: z.object({
          firstName: z.string(),
          lastName: z.string(),
        }),
        version: 2,
        migrate: (oldData: any) => {
          const [firstName, lastName] = oldData.name.split(' ');
          return { firstName, lastName };
        },
      });

      const data = store.get();
      expect(data).toEqual({ firstName: 'John', lastName: 'Doe' });
    });

    it('should not migrate if versions match', () => {
      const migrate = vi.fn();
      const store = createStore({
        key: 'test',
        schema: z.object({ name: z.string() }),
        version: 2,
        migrate,
      });

      store.set({ name: 'John' });
      store.get();

      expect(migrate).not.toHaveBeenCalled();
    });
  });

  describe('TTL (Time-To-Live)', () => {
    it('should expire data after TTL', () => {
      vi.useFakeTimers();

      const store = createStore({
        key: 'test',
        schema: z.string(),
        ttl: 1000, // 1 second
      });

      store.set('value');
      expect(store.get()).toBe('value');

      // Fast-forward time
      vi.advanceTimersByTime(1001);

      expect(store.get()).toBeNull();

      vi.useRealTimers();
    });

    it('should not expire before TTL', () => {
      vi.useFakeTimers();

      const store = createStore({
        key: 'test',
        schema: z.string(),
        ttl: 5000,
      });

      store.set('value');
      vi.advanceTimersByTime(4999);

      expect(store.get()).toBe('value');

      vi.useRealTimers();
    });
  });

  describe('Subscriptions', () => {
    it('should notify subscribers on set', () => {
      const store = createStore({
        key: 'test',
        schema: z.string(),
      });

      const callback = vi.fn();
      store.onUpdate(callback);

      store.set('value');

      expect(callback).toHaveBeenCalledWith('value');
    });

    it('should notify subscribers on remove', () => {
      const store = createStore({
        key: 'test',
        schema: z.string(),
      });

      store.set('value');

      const callback = vi.fn();
      store.onUpdate(callback);

      store.remove();

      expect(callback).toHaveBeenCalledWith(null);
    });

    it('should unsubscribe correctly', () => {
      const store = createStore({
        key: 'test',
        schema: z.string(),
      });

      const callback = vi.fn();
      const unsubscribe = store.onUpdate(callback);

      unsubscribe();
      store.set('value');

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Debounce', () => {
    it('should debounce set operations', () => {
      vi.useFakeTimers();

      const store = createStore({
        key: 'test',
        schema: z.number(),
        debounce: 500,
      });

      store.set(1);
      store.set(2);
      store.set(3);

      // Before debounce delay
      expect(localStorage.getItem('test')).toBeNull();

      // After debounce delay
      vi.advanceTimersByTime(500);
      expect(store.get()).toBe(3);

      vi.useRealTimers();
    });
  });

  describe('Raw Data', () => {
    it('should return raw stored data', () => {
      const store = createStore({
        key: 'test',
        schema: z.string(),
        version: 2,
      });

      store.set('value');
      const raw = store.getRaw();

      expect(raw).toMatchObject({
        value: 'value',
        version: 2,
      });
      expect(raw?.timestamp).toBeDefined();
    });
  });
});
