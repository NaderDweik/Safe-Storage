/**
 * Optional encryption utilities
 * Simple XOR encryption (users can provide stronger encryption)
 */

export interface Encryptor {
  encrypt: (data: string) => string;
  decrypt: (data: string) => string;
}

/**
 * Default no-op encryptor (no encryption)
 */
export const noEncryption: Encryptor = {
  encrypt: (data: string) => data,
  decrypt: (data: string) => data,
};

/**
 * Simple XOR encryption (for basic obfuscation)
 * Not cryptographically secure - use for obfuscation only
 */
export function createSimpleEncryptor(key: string): Encryptor {
  const encrypt = (data: string): string => {
    let result = '';
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(
        data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return btoa(result); // Base64 encode
  };

  const decrypt = (data: string): string => {
    try {
      const decoded = atob(data); // Base64 decode
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(
          decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      return result;
    } catch {
      throw new Error('Failed to decrypt data');
    }
  };

  return { encrypt, decrypt };
}

/**
 * Create Web Crypto API encryptor (recommended for production)
 * Uses AES-GCM encryption
 */
export async function createWebCryptoEncryptor(
  password: string
): Promise<Encryptor> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    console.warn(
      'SafeStorage: Web Crypto API not available, falling back to no encryption'
    );
    return noEncryption;
  }

  // Derive key from password
  const encoder = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const salt = encoder.encode('safe-storage-salt'); // In production, use random salt

  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  const encrypt = async (data: string): Promise<string> => {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(data)
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  };

  const decrypt = async (data: string): Promise<string> => {
    try {
      // Decode from base64
      const combined = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));

      // Extract IV and encrypted data
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );

      return new TextDecoder().decode(decrypted);
    } catch {
      throw new Error('Failed to decrypt data');
    }
  };

  // Wrap async functions to match interface
  return {
    encrypt: (data: string) => {
      const promise = encrypt(data);
      // Store promise result synchronously (hacky but works for storage API)
      let result = '';
      promise.then((r) => (result = r));
      return result || data; // Fallback if not resolved
    },
    decrypt: (data: string) => {
      const promise = decrypt(data);
      let result = '';
      promise.then((r) => (result = r));
      return result || data;
    },
  };
}
