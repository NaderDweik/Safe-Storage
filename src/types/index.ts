/**
 * Storage type options
 */
export type StorageType = 'local' | 'session';

/**
 * Validation result from schema parsers
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: unknown;
}

/**
 * Schema validator interface that works with Zod, Valibot, Yup, etc.
 */
export interface SchemaValidator<T> {
  parse: (data: unknown) => T;
  safeParse?: (data: unknown) => ValidationResult<T>;
}

/**
 * Migration function to transform old data to new format
 */
export type MigrationFunction<T> = (oldData: unknown) => T;

/**
 * Validation error handler
 */
export type ValidationErrorHandler = (error: unknown, key: string) => void;

/**
 * Update callback for change events
 */
export type UpdateCallback<T> = (newValue: T | null) => void;

/**
 * Serializer interface for custom serialization
 */
export interface Serializer {
  serialize: (data: unknown) => string;
  deserialize: (data: string) => unknown;
}

/**
 * Configuration options for creating a store
 */
export interface StoreOptions<T> {
  /**
   * Unique key for storage
   */
  key: string;

  /**
   * Schema validator (Zod, Valibot, etc.)
   */
  schema: SchemaValidator<T>;

  /**
   * Storage type: 'local' or 'session'
   * @default 'local'
   */
  storageType?: StorageType;

  /**
   * Version number for migrations
   */
  version?: number;

  /**
   * Migration function to transform old data
   */
  migrate?: MigrationFunction<T>;

  /**
   * Time-to-live in milliseconds
   */
  ttl?: number;

  /**
   * Default value if no data exists
   */
  defaultValue?: T;

  /**
   * Handler for validation errors
   */
  onValidationError?: ValidationErrorHandler;

  /**
   * Custom serializer (optional)
   */
  serializer?: Serializer;

  /**
   * Debounce delay for set/update operations (in milliseconds)
   */
  debounce?: number;

  /**
   * Throttle delay for set/update operations (in milliseconds)
   */
  throttle?: number;
}

/**
 * Internal stored data structure
 */
export interface StoredData<T> {
  value: T;
  version?: number;
  timestamp?: number;
  expiresAt?: number;
}

/**
 * Store instance interface
 */
export interface Store<T> {
  /**
   * Get the current value from storage
   */
  get(): T | null;

  /**
   * Set a new value in storage
   */
  set(data: T): void;

  /**
   * Update the value using an updater function
   */
  update(fn: (current: T | null) => T): void;

  /**
   * Remove the value from storage
   */
  remove(): void;

  /**
   * Subscribe to updates (including from other tabs)
   */
  onUpdate(callback: UpdateCallback<T>): () => void;

  /**
   * Check if the store has valid data
   */
  has(): boolean;

  /**
   * Get the raw stored data (for debugging)
   */
  getRaw(): StoredData<T> | null;
}
