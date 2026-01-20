/**
 * Vitest setup file
 * Mocks browser APIs for Node.js testing environment
 */

import { beforeEach, vi } from 'vitest';

// Mock localStorage and sessionStorage
const createStorage = () => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
};

const localStorageMock = createStorage();
const sessionStorageMock = createStorage();

// Setup global storage mocks
global.localStorage = localStorageMock as Storage;
global.sessionStorage = sessionStorageMock as Storage;

// Mock window object
(global as any).window = {
  localStorage: localStorageMock,
  sessionStorage: sessionStorageMock,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};

// Mock crypto with getRandomValues
const cryptoMock = {
  getRandomValues: <T extends ArrayBufferView>(array: T): T => {
    // Simple mock implementation
    for (let i = 0; i < array.byteLength; i++) {
      (array as any)[i] = Math.floor(Math.random() * 256);
    }
    return array;
  },
  subtle: {
    encrypt: vi.fn(),
    decrypt: vi.fn(),
    generateKey: vi.fn(),
    exportKey: vi.fn(),
    importKey: vi.fn(),
  },
};

global.crypto = cryptoMock as any;

// Clear storage before each test
beforeEach(() => {
  (localStorageMock as any).clear();
  (sessionStorageMock as any).clear();
  vi.clearAllMocks();
});
