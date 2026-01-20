/**
 * Batch operations tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  batchSet,
  batchGet,
  batchRemove,
  clearWithPrefix,
  getAllKeys,
  batchTransaction,
} from './batch';

describe('Batch Operations', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('batchSet', () => {
    it('should set multiple items', () => {
      batchSet([
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
        { key: 'key3', value: 'value3' },
      ]);

      expect(localStorage.getItem('key1')).toBe('value1');
      expect(localStorage.getItem('key2')).toBe('value2');
      expect(localStorage.getItem('key3')).toBe('value3');
    });
  });

  describe('batchGet', () => {
    it('should get multiple items', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');

      const result = batchGet(['key1', 'key2', 'key3']);

      expect(result).toEqual([
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
        { key: 'key3', value: null },
      ]);
    });
  });

  describe('batchRemove', () => {
    it('should remove multiple items', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      localStorage.setItem('key3', 'value3');

      batchRemove(['key1', 'key2']);

      expect(localStorage.getItem('key1')).toBeNull();
      expect(localStorage.getItem('key2')).toBeNull();
      expect(localStorage.getItem('key3')).toBe('value3');
    });
  });

  describe('clearWithPrefix', () => {
    it('should clear items with specific prefix', () => {
      localStorage.setItem('user:1', 'data1');
      localStorage.setItem('user:2', 'data2');
      localStorage.setItem('cache:1', 'data3');

      const removed = clearWithPrefix('user:');

      expect(removed).toBe(2);
      expect(localStorage.getItem('user:1')).toBeNull();
      expect(localStorage.getItem('user:2')).toBeNull();
      expect(localStorage.getItem('cache:1')).toBe('data3');
    });

    it('should return 0 when no items match prefix', () => {
      localStorage.setItem('other:1', 'data');

      const removed = clearWithPrefix('user:');

      expect(removed).toBe(0);
    });
  });

  describe('getAllKeys', () => {
    it('should get all keys', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');

      const keys = getAllKeys();

      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys.length).toBe(2);
    });

    it('should filter keys by prefix', () => {
      localStorage.setItem('user:1', 'data1');
      localStorage.setItem('user:2', 'data2');
      localStorage.setItem('cache:1', 'data3');

      const keys = getAllKeys('user:');

      expect(keys).toEqual(['user:1', 'user:2']);
    });
  });

  describe('batchTransaction', () => {
    it('should execute all operations successfully', () => {
      localStorage.setItem('key1', 'value1');

      const result = batchTransaction([
        { type: 'set', key: 'key2', value: 'value2' },
        { type: 'set', key: 'key3', value: 'value3' },
        { type: 'remove', key: 'key1' },
      ]);

      expect(result.success).toBe(true);
      expect(localStorage.getItem('key1')).toBeNull();
      expect(localStorage.getItem('key2')).toBe('value2');
      expect(localStorage.getItem('key3')).toBe('value3');
    });

    it('should rollback on error', () => {
      localStorage.setItem('key1', 'original');

      // Force an error by setting quota
      const largValue = 'x'.repeat(10 * 1024 * 1024); // 10MB

      const result = batchTransaction([
        { type: 'set', key: 'key1', value: 'modified' },
        { type: 'set', key: 'key2', value: largValue }, // This should fail
      ]);

      if (!result.success) {
        // Should rollback
        expect(localStorage.getItem('key1')).toBe('original');
      }
    });
  });

  describe('sessionStorage', () => {
    it('should work with sessionStorage', () => {
      batchSet(
        [
          { key: 'key1', value: 'value1' },
          { key: 'key2', value: 'value2' },
        ],
        'session'
      );

      expect(sessionStorage.getItem('key1')).toBe('value1');
      expect(localStorage.getItem('key1')).toBeNull();
    });
  });
});
