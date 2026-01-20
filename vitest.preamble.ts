/**
 * This file runs before Vite initializes to patch crypto for Node 16
 */

// Polyfill crypto.getRandomValues for Node 16
if (!global.crypto || typeof global.crypto.getRandomValues !== 'function') {
  const cryptoPolyfill = {
    getRandomValues: <T extends ArrayBufferView>(array: T): T => {
      // Simple polyfill using Math.random
      const bytes = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
    subtle: {},
    randomUUID: () => {
      // Simple UUID v4 generator
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },
  };

  Object.defineProperty(global, 'crypto', {
    value: cryptoPolyfill,
    writable: true,
    configurable: true,
  });
}
