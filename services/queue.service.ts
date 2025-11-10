import {
  QueueItem,
  QueueItemStatus,
  RequestType,
  SuccessLog,
} from "@/types/queue.types";
import { ApiService } from "./api.service";
import { StorageService } from "./storage.service";

/**
 * Configuration for retry logic
 */
const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_BACKOFF_MS: 1000, // 1 second
  MAX_BACKOFF_MS: 10000, // 10 seconds
};

/**
 * Queue Service
 * Manages the offline queue with priority handling (small requests before large)
 */
export class QueueService {
  private queue: QueueItem[] = [];
  private successLogs: SuccessLog[] = [];
  private totalCompletedCount: number = 0;
  private isProcessing: boolean = false;
  private listeners: (() => void)[] = [];

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the queue by loading from storage
   */
  private async initialize(): Promise<void> {
    try {
      this.queue = await StorageService.loadQueue();
      this.successLogs = await StorageService.loadSuccessLogs();

      // Load persisted total completed count
      this.totalCompletedCount = await StorageService.loadCompletedCount();

      // Single pass: reset PROCESSING items to PENDING and count statuses
      let hasProcessingItems = false;
      let pendingCount = 0;
      let failedCount = 0;

      for (const item of this.queue) {
        if (item.status === QueueItemStatus.PROCESSING) {
          item.status = QueueItemStatus.PENDING;
          hasProcessingItems = true;
          pendingCount++;
          console.log(
            `🔄 Resetting item ${item.id} from PROCESSING to PENDING`
          );
        } else if (item.status === QueueItemStatus.PENDING) {
          pendingCount++;
        } else if (item.status === QueueItemStatus.FAILED) {
          failedCount++;
        }
      }

      // Persist if we made changes
      if (hasProcessingItems) {
        await this.persistQueue();
      }

      console.log(
        `Queue initialized with ${this.queue.length} items (${pendingCount} pending, ${failedCount} failed)`
      );
      this.notifyListeners();
    } catch (error) {
      console.error("Failed to initialize queue:", error);
    }
  }

  /**
   * Add a new item to the queue
   */
  async addToQueue(type: RequestType, payload: any): Promise<QueueItem> {
    const item: QueueItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      status: QueueItemStatus.PENDING,
    };

    this.queue.push(item);
    await this.persistQueue();
    this.notifyListeners();

    console.log(
      `Added ${type} request to queue. Queue size: ${this.queue.length}`
    );
    return item;
  }

  /**
   * Get the next pending item with highest priority
   * Single O(n) pass to find the earliest small or large item
   */
  private getNextPendingItem(): QueueItem | null {
    let nextSmall: QueueItem | null = null;
    let nextLarge: QueueItem | null = null;

    // Single pass through queue to find next small and large items
    for (const item of this.queue) {
      if (item.status !== QueueItemStatus.PENDING) continue;

      if (item.type === RequestType.SMALL) {
        if (!nextSmall || item.timestamp < nextSmall.timestamp) {
          nextSmall = item;
        }
      } else {
        if (!nextLarge || item.timestamp < nextLarge.timestamp) {
          nextLarge = item;
        }
      }
    }

    // Small requests have priority
    return nextSmall || nextLarge;
  }

  /**
   * Process the queue - send all pending items with priority
   * Re-checks priority after each item to allow newly added high-priority items to jump the queue
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing) {
      console.log("Queue is already being processed");
      return;
    }

    this.isProcessing = true;
    console.log("🔄 Starting queue processing...");

    try {
      // Keep processing until no more pending items
      // Re-check after each task to respect dynamic priority
      let nextItem = this.getNextPendingItem();

      while (nextItem !== null) {
        console.log(`Processing next item: ${nextItem.id} (${nextItem.type})`);

        await this.processItem(nextItem);

        // Small delay to ensure UI updates before processing next item
        await new Promise((resolve) => setTimeout(resolve, 50));

        nextItem = this.getNextPendingItem();
      }

      console.log("✅ Queue processing completed");
    } catch (error) {
      console.error("Error processing queue:", error);
    } finally {
      this.isProcessing = false;
      this.notifyListeners();
    }
  }

  /**
   * Process a single queue item with retry logic
   */
  private async processItem(item: QueueItem): Promise<void> {
    try {
      console.log(`Processing item ${item.id} (${item.type})`);

      // Update status to processing
      item.status = QueueItemStatus.PROCESSING;
      await this.persistQueue();
      this.notifyListeners();

      // Send the request
      const response = await ApiService.send(item.type, item.payload);

      if (response.success) {
        // Mark as completed
        item.status = QueueItemStatus.COMPLETED;

        // Add to success logs
        const log: SuccessLog = {
          id: item.id,
          type: item.type,
          timestamp: item.timestamp,
          completedAt: Date.now(),
        };
        this.successLogs.unshift(log); // Add to beginning of array

        // Increment total completed count (keeps growing even when logs are trimmed)
        this.totalCompletedCount++;
        await StorageService.saveCompletedCount(this.totalCompletedCount);

        // Keep only last 50 logs for display
        if (this.successLogs.length > 50) {
          this.successLogs = this.successLogs.slice(0, 50);
        }

        await this.persistSuccessLogs();

        // Remove from queue
        this.queue = this.queue.filter((q) => q.id !== item.id);
        await this.persistQueue();

        console.log(`✅ Item ${item.id} processed successfully`);
      }
    } catch (error: any) {
      item.retryCount++;
      item.error = error.message;

      if (item.retryCount >= RETRY_CONFIG.MAX_RETRIES) {
        // Max retries reached - mark as failed but keep in queue
        item.status = QueueItemStatus.FAILED;
        console.error(
          `❌ Item ${item.id} PERMANENTLY FAILED after ${item.retryCount} retries:`,
          error.message
        );
      } else {
        // Reset to pending for retry
        item.status = QueueItemStatus.PENDING;

        // Calculate exponential backoff delay
        const backoffDelay = Math.min(
          RETRY_CONFIG.INITIAL_BACKOFF_MS * Math.pow(2, item.retryCount - 1),
          RETRY_CONFIG.MAX_BACKOFF_MS
        );

        console.log(
          `⚠️  Request failed (expected during demo), will retry item ${item.id} after ${backoffDelay}ms (attempt ${item.retryCount}/${RETRY_CONFIG.MAX_RETRIES})`
        );

        // Wait before next retry
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      }

      await this.persistQueue();
    }

    this.notifyListeners();
  }

  /**
   * Get queue statistics
   */
  getStats() {
    const pending = this.queue.filter(
      (item) => item.status === QueueItemStatus.PENDING
    );

    return {
      totalPending: pending.length,
      smallPending: pending.filter((item) => item.type === RequestType.SMALL)
        .length,
      largePending: pending.filter((item) => item.type === RequestType.LARGE)
        .length,
      totalCompleted: this.totalCompletedCount,
    };
  }

  /**
   * Get all queue items
   */
  getQueue(): QueueItem[] {
    return [...this.queue];
  }

  /**
   * Get items currently being processed
   */
  getProcessingItems(): QueueItem[] {
    return this.queue.filter(
      (item) => item.status === QueueItemStatus.PROCESSING
    );
  }

  /**
   * Get all pending and processing items (for display in pending queue)
   */
  getPendingAndProcessingItems(): QueueItem[] {
    const items = this.queue.filter(
      (item) =>
        item.status === QueueItemStatus.PENDING ||
        item.status === QueueItemStatus.PROCESSING
    );

    // Separate by type for priority
    const smallRequests = items.filter(
      (item) => item.type === RequestType.SMALL
    );
    const largeRequests = items.filter(
      (item) => item.type === RequestType.LARGE
    );

    // Sort each group by timestamp (FIFO)
    smallRequests.sort((a, b) => a.timestamp - b.timestamp);
    largeRequests.sort((a, b) => a.timestamp - b.timestamp);

    //  Return small requests first, then large requests  (deep copies so React detects changes in status)
    return [...smallRequests, ...largeRequests].map((item) => ({ ...item }));
  }

  /**
   * Get success logs
   */
  getSuccessLogs(): SuccessLog[] {
    return [...this.successLogs];
  }

  /**
   * Get failed items (reached max retries)
   */
  getFailedItems(): QueueItem[] {
    return this.queue
      .filter((item) => item.status === QueueItemStatus.FAILED)
      .map((item) => ({ ...item }));
  }

  /**
   * Retry a specific failed item
   */
  async retryFailedItem(itemId: string): Promise<void> {
    const item = this.queue.find((q) => q.id === itemId);
    if (!item || item.status !== QueueItemStatus.FAILED) {
      console.error(`Cannot retry item ${itemId}: not found or not failed`);
      return;
    }

    // Reset the item for retry
    item.status = QueueItemStatus.PENDING;
    item.retryCount = 0;
    item.error = undefined;

    await this.persistQueue();
    this.notifyListeners();

    console.log(`🔄 Retrying failed item ${itemId}`);

    // Trigger processing if not already processing
    await this.processQueue();
  }

  /**
   * Clear failed items from queue
   */
  async clearFailedItems(): Promise<void> {
    this.queue = this.queue.filter(
      (item) => item.status !== QueueItemStatus.FAILED
    );
    await this.persistQueue();
    this.notifyListeners();
  }

  /**
   * Clear all data (for testing)
   */
  async clearAll(): Promise<void> {
    this.queue = [];
    this.successLogs = [];
    this.totalCompletedCount = 0;
    await StorageService.clearAll();
    this.notifyListeners();
  }

  /**
   * Persist queue to storage
   */
  private async persistQueue(): Promise<void> {
    await StorageService.saveQueue(this.queue);
  }

  /**
   * Persist success logs to storage
   */
  private async persistSuccessLogs(): Promise<void> {
    await StorageService.saveSuccessLogs(this.successLogs);
  }

  /**
   * Subscribe to queue changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }
}

// Singleton instance
export const queueService = new QueueService();
