/**
 * Serializer tests
 */

import { describe, it, expect } from 'vitest';
import { defaultSerializer } from './serializer';

describe('defaultSerializer', () => {
  describe('Date serialization', () => {
    it('should serialize and deserialize Date objects', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const serialized = defaultSerializer.serialize(date);
      const deserialized = defaultSerializer.deserialize(serialized);

      expect(deserialized).toBeInstanceOf(Date);
      expect((deserialized as Date).getTime()).toBe(date.getTime());
    });

    it('should handle dates in nested objects', () => {
      const data = {
        user: {
          createdAt: new Date('2024-01-01'),
        },
      };

      const serialized = defaultSerializer.serialize(data);
      const deserialized = defaultSerializer.deserialize(serialized) as typeof data;

      expect(deserialized.user.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('Map serialization', () => {
    it('should serialize and deserialize Map objects', () => {
      const map = new Map([
        ['key1', 'value1'],
        ['key2', 'value2'],
      ]);

      const serialized = defaultSerializer.serialize(map);
      const deserialized = defaultSerializer.deserialize(serialized);

      expect(deserialized).toBeInstanceOf(Map);
      expect((deserialized as Map<string, string>).get('key1')).toBe('value1');
      expect((deserialized as Map<string, string>).get('key2')).toBe('value2');
    });

    it('should handle complex Map entries', () => {
      const map = new Map([
        ['numbers', [1, 2, 3]],
        ['nested', { a: 1, b: 2 }],
      ]);

      const serialized = defaultSerializer.serialize(map);
      const deserialized = defaultSerializer.deserialize(serialized) as Map<string, any>;

      expect(deserialized.get('numbers')).toEqual([1, 2, 3]);
      expect(deserialized.get('nested')).toEqual({ a: 1, b: 2 });
    });
  });

  describe('Set serialization', () => {
    it('should serialize and deserialize Set objects', () => {
      const set = new Set(['a', 'b', 'c']);

      const serialized = defaultSerializer.serialize(set);
      const deserialized = defaultSerializer.deserialize(serialized);

      expect(deserialized).toBeInstanceOf(Set);
      expect((deserialized as Set<string>).has('a')).toBe(true);
      expect((deserialized as Set<string>).has('b')).toBe(true);
      expect((deserialized as Set<string>).has('c')).toBe(true);
    });

    it('should handle Set of numbers', () => {
      const set = new Set([1, 2, 3, 4, 5]);

      const serialized = defaultSerializer.serialize(set);
      const deserialized = defaultSerializer.deserialize(serialized) as Set<number>;

      expect(deserialized.size).toBe(5);
      expect(deserialized.has(3)).toBe(true);
    });
  });

  describe('Complex objects', () => {
    it('should handle objects with multiple special types', () => {
      const data = {
        createdAt: new Date('2024-01-01'),
        tags: new Set(['typescript', 'testing']),
        metadata: new Map([['version', '1.0']]),
        nested: {
          updatedAt: new Date('2024-01-02'),
        },
      };

      const serialized = defaultSerializer.serialize(data);
      const deserialized = defaultSerializer.deserialize(serialized) as typeof data;

      expect(deserialized.createdAt).toBeInstanceOf(Date);
      expect(deserialized.tags).toBeInstanceOf(Set);
      expect(deserialized.metadata).toBeInstanceOf(Map);
      expect(deserialized.nested.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Edge cases', () => {
    it('should handle null', () => {
      const serialized = defaultSerializer.serialize(null);
      const deserialized = defaultSerializer.deserialize(serialized);
      expect(deserialized).toBeNull();
    });

    it('should handle undefined', () => {
      const data = { value: undefined };
      const serialized = defaultSerializer.serialize(data);
      const deserialized = defaultSerializer.deserialize(serialized) as typeof data;
      expect(deserialized.value).toBeUndefined();
    });

    it('should handle arrays', () => {
      const data = [1, 'two', { three: 3 }];
      const serialized = defaultSerializer.serialize(data);
      const deserialized = defaultSerializer.deserialize(serialized);
      expect(deserialized).toEqual(data);
    });

    it('should throw on invalid JSON', () => {
      expect(() => defaultSerializer.deserialize('invalid-json')).toThrow();
    });
  });
});
