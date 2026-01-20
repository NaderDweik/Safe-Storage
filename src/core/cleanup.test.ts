/**
 * Cleanup utilities tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cleanupStorage, getStorageStats } from './cleanup';

describe('Cleanup Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  describe('cleanupStorage', () => {
    it('should remove items older than maxAge', () => {
      const now = Date.now();

      // Old item
      localStorage.setItem(
        'old',
        JSON.stringify({ value: 'data', timestamp: now - 8 * 24 * 60 * 60 * 1000 })
      );

      // Recent item
      localStorage.setItem(
        'recent',
        JSON.stringify({ value: 'data', timestamp: now })
      );

      const result = cleanupStorage({
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      expect(result.removed).toBe(1);
      expect(localStorage.getItem('old')).toBeNull();
      expect(localStorage.getItem('recent')).not.toBeNull();
    });

    it('should limit items to maxItems', () => {
      const now = Date.now();

      for (let i = 0; i < 10; i++) {
        localStorage.setItem(
          `item${i}`,
          JSON.stringify({ value: 'data', timestamp: now - i * 1000 })
        );
      }

      const result = cleanupStorage({
        maxItems: 5,
        strategy: 'oldest',
      });

      expect(result.removed).toBe(5);
      expect(localStorage.length).toBe(5);
    });

    it('should only clean items with prefix', () => {
      localStorage.setItem('cache:1', JSON.stringify({ value: 'data', timestamp: 0 }));
      localStorage.setItem('cache:2', JSON.stringify({ value: 'data', timestamp: 0 }));
      localStorage.setItem('user:1', JSON.stringify({ value: 'data', timestamp: 0 }));

      const result = cleanupStorage({
        maxAge: 1000,
        prefix: 'cache:',
      });

      expect(result.removed).toBe(2);
      expect(localStorage.getItem('user:1')).not.toBeNull();
    });

    it('should support dry run', () => {
      localStorage.setItem(
        'test',
        JSON.stringify({ value: 'data', timestamp: 0 })
      );

      const result = cleanupStorage({
        maxAge: 1000,
        dryRun: true,
      });

      expect(result.removed).toBe(1);
      expect(result.keys).toContain('test');
      expect(localStorage.getItem('test')).not.toBeNull(); // Not actually removed
    });

    it('should use LRU strategy', () => {
      const now = Date.now();

      localStorage.setItem(
        'item1',
        JSON.stringify({
          value: 'data',
          timestamp: now - 5000,
          lastAccessed: now - 1000,
        })
      );

      localStorage.setItem(
        'item2',
        JSON.stringify({
          value: 'data',
          timestamp: now - 10000,
          lastAccessed: now - 5000,
        })
      );

      const result = cleanupStorage({
        maxItems: 1,
        strategy: 'lru',
      });

      expect(result.removed).toBe(1);
      expect(localStorage.getItem('item2')).toBeNull(); // Least recently used
      expect(localStorage.getItem('item1')).not.toBeNull();
    });
  });

  describe('getStorageStats', () => {
    it('should return storage statistics', () => {
      const now = Date.now();

      localStorage.setItem(
        'item1',
        JSON.stringify({ value: 'x'.repeat(100), timestamp: now - 5000 })
      );

      localStorage.setItem(
        'item2',
        JSON.stringify({ value: 'x'.repeat(200), timestamp: now })
      );

      const stats = getStorageStats();

      expect(stats.totalItems).toBe(2);
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(stats.oldestItem).toBe(now - 5000);
      expect(stats.newestItem).toBe(now);
      expect(stats.averageSize).toBeGreaterThan(0);
    });

    it('should filter stats by prefix', () => {
      localStorage.setItem('cache:1', JSON.stringify({ value: 'data', timestamp: 0 }));
      localStorage.setItem('cache:2', JSON.stringify({ value: 'data', timestamp: 0 }));
      localStorage.setItem('user:1', JSON.stringify({ value: 'data', timestamp: 0 }));

      const stats = getStorageStats('cache:');

      expect(stats.totalItems).toBe(2);
    });

    it('should handle empty storage', () => {
      const stats = getStorageStats();

      expect(stats).toEqual({
        totalItems: 0,
        totalSize: 0,
        oldestItem: 0,
        newestItem: 0,
        averageSize: 0,
      });
    });
  });
});
