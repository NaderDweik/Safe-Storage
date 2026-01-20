/**
 * Debounce and throttle utilities for storage operations
 */

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): T & { cancel: () => void; flush: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: unknown[] | null = null;

  const debouncedFn = function (this: unknown, ...args: unknown[]) {
    lastArgs = args;
    
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn.apply(this, args);
      timeoutId = null;
      lastArgs = null;
    }, delay);
  } as T & { cancel: () => void; flush: () => void };

  debouncedFn.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
    }
  };

  debouncedFn.flush = function (this: unknown) {
    if (timeoutId !== null && lastArgs !== null) {
      clearTimeout(timeoutId);
      fn.apply(this, lastArgs);
      timeoutId = null;
      lastArgs = null;
    }
  };

  return debouncedFn;
}

export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): T & { cancel: () => void } {
  let isThrottled = false;
  let lastArgs: unknown[] | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const throttledFn = function (this: unknown, ...args: unknown[]) {
    if (isThrottled) {
      lastArgs = args;
      return;
    }

    fn.apply(this, args);
    isThrottled = true;

    timeoutId = setTimeout(() => {
      isThrottled = false;
      if (lastArgs !== null) {
        fn.apply(this, lastArgs);
        lastArgs = null;
      }
      timeoutId = null;
    }, delay);
  } as T & { cancel: () => void };

  throttledFn.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    isThrottled = false;
    lastArgs = null;
  };

  return throttledFn;
}
