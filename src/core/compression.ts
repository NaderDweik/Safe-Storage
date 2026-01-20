/**
 * Optional compression utilities
 * Uses LZ-string for compression
 */

export interface Compressor {
  compress: (data: string) => string;
  decompress: (data: string) => string;
}

/**
 * Default no-op compressor (no compression)
 */
export const noCompression: Compressor = {
  compress: (data: string) => data,
  decompress: (data: string) => data,
};

/**
 * Create LZ-string compressor (requires lz-string package)
 * This is a factory to avoid bundling if not used
 */
export function createLZCompressor(): Compressor {
  // Users need to install lz-string separately
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const LZString = require('lz-string');
    return {
      compress: (data: string) => LZString.compressToUTF16(data),
      decompress: (data: string) => LZString.decompressFromUTF16(data),
    };
  } catch {
    console.warn(
      'SafeStorage: lz-string not found. Install it for compression: npm install lz-string'
    );
    return noCompression;
  }
}
