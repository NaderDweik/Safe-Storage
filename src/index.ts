/**
 * SafeStorage - Type-safe browser storage with schema validation
 */

export { createStore } from './core/store';
export { defaultSerializer } from './core/serializer';

// Batch operations
export {
  batchSet,
  batchGet,
  batchRemove,
  clearWithPrefix,
  getAllKeys,
  batchTransaction,
} from './core/batch';

// Storage quota utilities
export {
  getStorageInfo,
  canStore,
  estimateCurrentSize,
  formatBytes,
} from './core/quota';

// Storage cleanup utilities
export {
  cleanupStorage,
  scheduleCleanup,
  getStorageStats,
} from './core/cleanup';

export type { CleanupOptions } from './core/cleanup';

// Error classes
export {
  SafeStorageError,
  ValidationError,
  QuotaExceededError,
  MigrationError,
  SerializationError,
  DeserializationError,
  isSafeStorageError,
  formatError,
} from './core/errors';

// Middleware
export {
  composeMiddleware,
  applyMiddleware,
  loggerMiddleware,
  performanceMiddleware,
  changeTrackerMiddleware,
  validationReporterMiddleware,
} from './core/middleware';

export type { Middleware, MiddlewareContext } from './core/middleware';

// Optional compression (requires lz-string)
export { createLZCompressor, noCompression } from './core/compression';
export type { Compressor } from './core/compression';

// Optional encryption
export {
  createSimpleEncryptor,
  createWebCryptoEncryptor,
  noEncryption,
} from './core/encryption';
export type { Encryptor } from './core/encryption';

// Core types
export type {
  Store,
  StoreOptions,
  StorageType,
  ValidationResult,
  SchemaValidator,
  MigrationFunction,
  ValidationErrorHandler,
  UpdateCallback,
  Serializer,
  StoredData,
} from './types';
