/**
 * Advanced features demonstration
 */

import { z } from 'zod';
import {
  createStore,
  batchSet,
  batchGet,
  batchRemove,
  getStorageInfo,
  canStore,
  estimateCurrentSize,
  formatBytes,
  loggerMiddleware,
  performanceMiddleware,
  applyMiddleware,
} from '../src';

// ===================
// 1. Storage Quota Checking
// ===================

async function demonstrateQuotaChecking() {
  console.log('\n=== Storage Quota Checking ===');
  
  const info = await getStorageInfo();
  if (info) {
    console.log(`Storage used: ${formatBytes(info.usage)}`);
    console.log(`Storage quota: ${formatBytes(info.quota)}`);
    console.log(`Available: ${formatBytes(info.available)}`);
    console.log(`Percent used: ${info.percentUsed.toFixed(2)}%`);
  }
  
  const currentSize = estimateCurrentSize();
  console.log(`\nCurrent localStorage size: ${formatBytes(currentSize)}`);
  
  // Check before storing
  const largeData = JSON.stringify({ data: 'x'.repeat(1000000) });
  if (canStore(largeData)) {
    console.log('✓ Can store data safely');
  } else {
    console.log('✗ Not enough space!');
  }
}

// ===================
// 2. Batch Operations
// ===================

function demonstrateBatchOperations() {
  console.log('\n=== Batch Operations ===');
  
  // Batch set
  batchSet([
    { key: 'user:1', value: JSON.stringify({ name: 'Alice' }) },
    { key: 'user:2', value: JSON.stringify({ name: 'Bob' }) },
    { key: 'user:3', value: JSON.stringify({ name: 'Charlie' }) },
  ]);
  console.log('✓ Batch set 3 users');
  
  // Batch get
  const users = batchGet(['user:1', 'user:2', 'user:3']);
  console.log('Batch get result:', users);
  
  // Batch remove
  batchRemove(['user:1', 'user:2', 'user:3']);
  console.log('✓ Batch removed 3 users');
}

// ===================
// 3. Middleware System
// ===================

function demonstrateMiddleware() {
  console.log('\n=== Middleware System ===');
  
  const userSchema = z.object({
    name: z.string(),
    email: z.string().email(),
  });
  
  // Create store with middleware
  let baseStore = createStore({
    key: 'user-with-middleware',
    schema: userSchema,
  });
  
  // Apply middleware
  const store = applyMiddleware(baseStore, [
    loggerMiddleware({ logGet: true, logSet: true }),
    performanceMiddleware(),
  ]);
  
  // Operations will be logged and monitored
  store.set({ name: 'John', email: 'john@example.com' });
  store.get();
  store.remove();
}

// ===================
// 4. Better Error Handling
// ===================

function demonstrateErrorHandling() {
  console.log('\n=== Error Handling ===');
  
  const strictSchema = z.object({
    age: z.number().min(0).max(150),
  });
  
  const store = createStore({
    key: 'strict-data',
    schema: strictSchema,
    onValidationError: (error, key) => {
      console.error(`Validation failed for key "${key}":`, error);
    },
  });
  
  try {
    // This will pass validation
    store.set({ age: 30 });
    console.log('✓ Valid data stored');
    
    // Manually corrupt data to test validation
    localStorage.setItem('strict-data', JSON.stringify({ 
      value: { age: 'invalid' },
      version: 1 
    }));
    
    // This will fail validation gracefully
    const data = store.get();
    console.log('Data after corruption:', data); // null
  } catch (error) {
    console.error('Error:', error);
  }
}

// ===================
// 5. Advanced Store Configuration
// ===================

function demonstrateAdvancedConfig() {
  console.log('\n=== Advanced Configuration ===');
  
  const productSchema = z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    lastUpdated: z.date(),
  });
  
  const store = createStore({
    key: 'products',
    schema: productSchema,
    storageType: 'local',
    version: 2,
    ttl: 1000 * 60 * 60 * 24, // 24 hours
    defaultValue: {
      id: '0',
      name: 'Unknown',
      price: 0,
      lastUpdated: new Date(),
    },
    migrate: (oldData) => {
      // Migrate old data format
      return {
        ...(oldData as object),
        lastUpdated: new Date(),
      };
    },
    onValidationError: (error, key) => {
      console.error(`Validation error for ${key}:`, error);
    },
  });
  
  store.set({
    id: '123',
    name: 'Premium Product',
    price: 99.99,
    lastUpdated: new Date(),
  });
  
  console.log('Product stored:', store.get());
}

// ===================
// Run All Demos
// ===================

async function runAllDemos() {
  await demonstrateQuotaChecking();
  demonstrateBatchOperations();
  demonstrateMiddleware();
  demonstrateErrorHandling();
  demonstrateAdvancedConfig();
  
  console.log('\n✓ All demos completed!');
}

// Run if executed directly
if (typeof window !== 'undefined') {
  runAllDemos().catch(console.error);
}

export { runAllDemos };
