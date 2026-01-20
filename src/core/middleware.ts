/**
 * Middleware system for extending store functionality
 */

import type { Store } from '../types';

export type MiddlewareAction = 'get' | 'set' | 'update' | 'remove';

export interface MiddlewareContext<T> {
  action: MiddlewareAction;
  key: string;
  value?: T | null;
  timestamp: number;
}

export type MiddlewareFunction<T> = (
  context: MiddlewareContext<T>,
  next: () => void
) => void;

export type Middleware<T> = MiddlewareFunction<T>;

/**
 * Compose multiple middleware functions
 */
export function composeMiddleware<T>(
  middlewares: Middleware<T>[]
): (context: MiddlewareContext<T>, final: () => void) => void {
  return (context: MiddlewareContext<T>, final: () => void) => {
    let index = -1;

    const dispatch = (i: number): void => {
      if (i <= index) {
        throw new Error('Middleware called next() multiple times');
      }

      index = i;

      if (i === middlewares.length) {
        final();
        return;
      }

      const middleware = middlewares[i];
      middleware(context, () => dispatch(i + 1));
    };

    dispatch(0);
  };
}

/**
 * Built-in middleware: Logger
 */
export function loggerMiddleware<T>(
  options: {
    logGet?: boolean;
    logSet?: boolean;
    logRemove?: boolean;
  } = {}
): Middleware<T> {
  const { logGet = false, logSet = true, logRemove = true } = options;

  return (context, next) => {
    const shouldLog =
      (context.action === 'get' && logGet) ||
      (context.action === 'set' && logSet) ||
      (context.action === 'update' && logSet) ||
      (context.action === 'remove' && logRemove);

    if (shouldLog) {
      console.log(
        `[SafeStorage] ${context.action.toUpperCase()} "${context.key}"`,
        context.value
      );
    }

    next();
  };
}

/**
 * Built-in middleware: Performance monitor
 */
export function performanceMiddleware<T>(): Middleware<T> {
  return (context, next) => {
    const start = performance.now();
    next();
    const duration = performance.now() - start;

    if (duration > 10) {
      console.warn(
        `[SafeStorage] Slow operation: ${context.action} "${context.key}" took ${duration.toFixed(2)}ms`
      );
    }
  };
}

/**
 * Built-in middleware: Change tracker
 */
export function changeTrackerMiddleware<T>(
  onChange: (context: MiddlewareContext<T>) => void
): Middleware<T> {
  return (context, next) => {
    next();
    if (context.action === 'set' || context.action === 'update' || context.action === 'remove') {
      onChange(context);
    }
  };
}

/**
 * Built-in middleware: Validation reporter
 */
export function validationReporterMiddleware<T>(
  onValidationError: (key: string, error: unknown) => void
): Middleware<T> {
  return (context, next) => {
    try {
      next();
    } catch (error) {
      onValidationError(context.key, error);
      throw error;
    }
  };
}

/**
 * Apply middleware to store operations
 */
export function applyMiddleware<T>(
  store: Store<T>,
  middlewares: Middleware<T>[]
): Store<T> {
  const composed = composeMiddleware(middlewares);

  return {
    get: () => {
      let result: T | null = null;
      composed(
        {
          action: 'get',
          key: (store as any)._key || 'unknown',
          timestamp: Date.now(),
        },
        () => {
          result = store.get();
        }
      );
      return result;
    },

    set: (data: T) => {
      composed(
        {
          action: 'set',
          key: (store as any)._key || 'unknown',
          value: data,
          timestamp: Date.now(),
        },
        () => {
          store.set(data);
        }
      );
    },

    update: (fn) => {
      composed(
        {
          action: 'update',
          key: (store as any)._key || 'unknown',
          timestamp: Date.now(),
        },
        () => {
          store.update(fn);
        }
      );
    },

    remove: () => {
      composed(
        {
          action: 'remove',
          key: (store as any)._key || 'unknown',
          timestamp: Date.now(),
        },
        () => {
          store.remove();
        }
      );
    },

    onUpdate: store.onUpdate,
    has: store.has,
    getRaw: store.getRaw,
  };
}
