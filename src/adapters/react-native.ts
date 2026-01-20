/**
 * React Native AsyncStorage adapter
 * Requires: @react-native-async-storage/async-storage
 */

export interface AsyncStorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
}

/**
 * Create AsyncStorage adapter for React Native
 */
export function createAsyncStorageAdapter(): AsyncStorageAdapter {
  let AsyncStorage: any;

  try {
    // Dynamic import to avoid errors in web environments
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch {
    throw new Error(
      'AsyncStorage not found. Install it: npm install @react-native-async-storage/async-storage'
    );
  }

  async function getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('AsyncStorage getItem error:', error);
      return null;
    }
  }

  async function setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('AsyncStorage setItem error:', error);
      throw error;
    }
  }

  async function removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('AsyncStorage removeItem error:', error);
      throw error;
    }
  }

  async function clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('AsyncStorage clear error:', error);
      throw error;
    }
  }

  async function getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('AsyncStorage getAllKeys error:', error);
      return [];
    }
  }

  return {
    getItem,
    setItem,
    removeItem,
    clear,
    getAllKeys,
  };
}

/**
 * Check if AsyncStorage is available
 */
export function isAsyncStorageAvailable(): boolean {
  try {
    require('@react-native-async-storage/async-storage');
    return true;
  } catch {
    return false;
  }
}
