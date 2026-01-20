/**
 * Storage quota utilities to prevent QuotaExceededError
 */

export interface StorageInfo {
  usage: number;
  quota: number;
  available: number;
  percentUsed: number;
}

/**
 * Get storage quota information
 */
export async function getStorageInfo(): Promise<StorageInfo | null> {
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) {
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const available = quota - usage;
    const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;

    return {
      usage,
      quota,
      available,
      percentUsed,
    };
  } catch {
    return null;
  }
}

/**
 * Check if data can fit in storage
 */
export function canStore(data: string, threshold = 0.9): boolean {
  const size = new Blob([data]).size;
  
  // localStorage typically has 5-10MB limit
  const estimatedLimit = 5 * 1024 * 1024; // 5MB
  const currentSize = estimateCurrentSize();
  
  return (currentSize + size) < (estimatedLimit * threshold);
}

/**
 * Estimate current localStorage size
 */
export function estimateCurrentSize(): number {
  if (typeof window === 'undefined') return 0;
  
  let total = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      const value = localStorage.getItem(key) || '';
      total += new Blob([key + value]).size;
    }
  }
  return total;
}

/**
 * Get human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
