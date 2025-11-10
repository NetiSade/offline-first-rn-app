import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueueItem, SuccessLog } from '@/types/queue.types';

/**
 * Keys for AsyncStorage
 */
const STORAGE_KEYS = {
  QUEUE: '@offline_queue',
  SUCCESS_LOGS: '@success_logs',
  COMPLETED_COUNT: '@completed_count',
  SYNC_MODE: '@sync_mode',
  THEME: '@theme',
};

/**
 * Storage service for persisting queue and success logs
 * Uses AsyncStorage to ensure data persists between app restarts
 */
export const StorageService = {
  /**
   * Save the current queue to storage
   */
  async saveQueue(queue: QueueItem[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(queue);
      await AsyncStorage.setItem(STORAGE_KEYS.QUEUE, jsonValue);
    } catch (error) {
      console.error('Error saving queue to storage:', error);
      throw error;
    }
  },

  /**
   * Load the queue from storage
   */
  async loadQueue(): Promise<QueueItem[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.QUEUE);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Error loading queue from storage:', error);
      return [];
    }
  },

  /**
   * Clear the queue from storage
   */
  async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.QUEUE);
    } catch (error) {
      console.error('Error clearing queue from storage:', error);
      throw error;
    }
  },

  /**
   * Save success logs to storage
   */
  async saveSuccessLogs(logs: SuccessLog[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(logs);
      await AsyncStorage.setItem(STORAGE_KEYS.SUCCESS_LOGS, jsonValue);
    } catch (error) {
      console.error('Error saving success logs to storage:', error);
      throw error;
    }
  },

  /**
   * Load success logs from storage
   */
  async loadSuccessLogs(): Promise<SuccessLog[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.SUCCESS_LOGS);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Error loading success logs from storage:', error);
      return [];
    }
  },

  /**
   * Clear success logs from storage
   */
  async clearSuccessLogs(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SUCCESS_LOGS);
    } catch (error) {
      console.error('Error clearing success logs from storage:', error);
      throw error;
    }
  },

  /**
   * Save completed count to storage
   */
  async saveCompletedCount(count: number): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.COMPLETED_COUNT, count.toString());
    } catch (error) {
      console.error('Error saving completed count to storage:', error);
      throw error;
    }
  },

  /**
   * Load completed count from storage
   */
  async loadCompletedCount(): Promise<number> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_COUNT);
      return value != null ? parseInt(value, 10) : 0;
    } catch (error) {
      console.error('Error loading completed count from storage:', error);
      return 0;
    }
  },

  /**
   * Save sync mode preference to storage
   */
  async saveSyncMode(isManual: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SYNC_MODE, JSON.stringify(isManual));
    } catch (error) {
      console.error('Error saving sync mode to storage:', error);
      throw error;
    }
  },

  /**
   * Load sync mode preference from storage
   */
  async loadSyncMode(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_MODE);
      return value != null ? JSON.parse(value) : false; // Default to auto mode (false)
    } catch (error) {
      console.error('Error loading sync mode from storage:', error);
      return false; // Default to auto mode on error
    }
  },

  /**
   * Save theme preference to storage
   */
  async saveTheme(theme: 'light' | 'dark' | null): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(theme));
    } catch (error) {
      console.error('Error saving theme to storage:', error);
      throw error;
    }
  },

  /**
   * Load theme preference from storage
   */
  async loadTheme(): Promise<'light' | 'dark' | null> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      return value != null ? JSON.parse(value) : null; // Default to system theme (null)
    } catch (error) {
      console.error('Error loading theme from storage:', error);
      return null; // Default to system theme on error
    }
  },

  /**
   * Clear all storage (for testing/reset purposes)
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.QUEUE,
        STORAGE_KEYS.SUCCESS_LOGS,
        STORAGE_KEYS.COMPLETED_COUNT,
        STORAGE_KEYS.SYNC_MODE,
        STORAGE_KEYS.THEME,
      ]);
    } catch (error) {
      console.error('Error clearing all storage:', error);
      throw error;
    }
  },
};

