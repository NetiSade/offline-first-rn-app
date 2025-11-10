import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueueItem, SuccessLog } from '@/types/queue.types';

/**
 * Keys for AsyncStorage
 */
const STORAGE_KEYS = {
  QUEUE: '@offline_queue',
  SUCCESS_LOGS: '@success_logs',
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
   * Clear all storage (for testing/reset purposes)
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.QUEUE, STORAGE_KEYS.SUCCESS_LOGS]);
    } catch (error) {
      console.error('Error clearing all storage:', error);
      throw error;
    }
  },
};

