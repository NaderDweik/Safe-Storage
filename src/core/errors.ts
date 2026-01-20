/**
 * Custom error classes for better error handling
 */

export class SafeStorageError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'SafeStorageError';
    Object.setPrototypeOf(this, SafeStorageError.prototype);
  }
}

export class ValidationError extends SafeStorageError {
  constructor(
    message: string,
    public key: string,
    public validationError: unknown
  ) {
    super(message, 'VALIDATION_ERROR', { key, validationError });
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class QuotaExceededError extends SafeStorageError {
  constructor(
    message: string,
    public key: string,
    public size: number
  ) {
    super(message, 'QUOTA_EXCEEDED', { key, size });
    this.name = 'QuotaExceededError';
    Object.setPrototypeOf(this, QuotaExceededError.prototype);
  }
}

export class MigrationError extends SafeStorageError {
  constructor(
    message: string,
    public key: string,
    public fromVersion: number | undefined,
    public toVersion: number,
    public originalError: unknown
  ) {
    super(message, 'MIGRATION_ERROR', {
      key,
      fromVersion,
      toVersion,
      originalError,
    });
    this.name = 'MigrationError';
    Object.setPrototypeOf(this, MigrationError.prototype);
  }
}

export class SerializationError extends SafeStorageError {
  constructor(
    message: string,
    public key: string,
    public data: unknown,
    public originalError: unknown
  ) {
    super(message, 'SERIALIZATION_ERROR', { key, originalError });
    this.name = 'SerializationError';
    Object.setPrototypeOf(this, SerializationError.prototype);
  }
}

export class DeserializationError extends SafeStorageError {
  constructor(
    message: string,
    public key: string,
    public rawData: string,
    public originalError: unknown
  ) {
    super(message, 'DESERIALIZATION_ERROR', { key, originalError });
    this.name = 'DeserializationError';
    Object.setPrototypeOf(this, DeserializationError.prototype);
  }
}

/**
 * Type guard to check if error is SafeStorageError
 */
export function isSafeStorageError(error: unknown): error is SafeStorageError {
  return error instanceof SafeStorageError;
}

/**
 * Format error for logging
 */
export function formatError(error: unknown): string {
  if (isSafeStorageError(error)) {
    const parts = [
      `[${error.code}] ${error.message}`,
    ];
    
    if (error.context) {
      parts.push(`Context: ${JSON.stringify(error.context, null, 2)}`);
    }
    
    return parts.join('\n');
  }
  
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  
  return String(error);
}
