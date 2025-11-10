import { queueService } from "@/services/queue.service";
import { syncService } from "@/services/sync.service";
import {
  QueueItem,
  QueueStats,
  RequestType,
  SuccessLog,
} from "@/types/queue.types";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Custom hook for offline queue operations
 * Provides easy access to queue functionality and state
 * @param manualSync - If true, requires manual sync button; if false, auto-syncs when online
 */
export const useOfflineQueue = (manualSync: boolean = false) => {
  const [isOnline, setIsOnline] = useState(true);
  const [stats, setStats] = useState<QueueStats>({
    totalPending: 0,
    smallPending: 0,
    largePending: 0,
    totalCompleted: 0,
  });
  const [successLogs, setSuccessLogs] = useState<SuccessLog[]>([]);
  const [pendingItems, setPendingItems] = useState<QueueItem[]>([]);
  const [failedItems, setFailedItems] = useState<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const isFirstMount = useRef(true);

  /**
   * Update stats and logs
   */
  const updateState = useCallback(() => {
    setStats(queueService.getStats());
    setSuccessLogs(queueService.getSuccessLogs());
    setPendingItems(queueService.getPendingAndProcessingItems());
    setFailedItems(queueService.getFailedItems());
  }, []);

  /**
   * Initialize and subscribe to changes
   */
  useEffect(() => {
    // Initial state
    updateState();

    // Subscribe to queue changes
    const unsubscribeQueue = queueService.subscribe(() => {
      updateState();
    });

    // Subscribe to network changes
    const unsubscribeNetwork = syncService.subscribeToNetworkChanges(
      (online) => {
        setIsOnline(online);
      }
    );

    // Cleanup
    return () => {
      unsubscribeQueue();
      unsubscribeNetwork();
    };
  }, [updateState]);

  /**
   * Process the queue
   */
  const processQueue = useCallback(async () => {
    if (isProcessing) {
      console.log("Already processing queue, skipping...");
      return;
    }

    setIsProcessing(true);
    try {
      // The queue service now handles processing all items including those added during processing
      await syncService.triggerSync();
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  /**
   * Update sync service when manualSync mode changes
   */
  useEffect(() => {
    // Skip on first mount - let the service handle initialization from storage
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    syncService.setManualSyncMode(manualSync);

    // If switching to auto mode (manualSync = false) and online with pending tasks, trigger sync
    if (!manualSync && isOnline && stats.totalPending > 0) {
      console.log("📱 Switched to Auto Mode - processing pending queue...");
      processQueue();
    }
    // Only run when manualSync actually changes, not on every stats update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualSync]);

  /**
   * Add a small request to the queue
   */
  const addSmallRequest = useCallback(async () => {
    const payload = {
      type: "small",
      data: `Small request data - ${Date.now()}`,
      timestamp: Date.now(),
    };

    await queueService.addToQueue(RequestType.SMALL, payload);

    // If in auto mode and online, process immediately
    if (!manualSync && isOnline) {
      processQueue();
    }
  }, [isOnline, manualSync, processQueue]);

  /**
   * Add a large request to the queue
   */
  const addLargeRequest = useCallback(async () => {
    const payload = {
      type: "large",
      data: `Large request data - ${Date.now()}`,
      // Simulate large payload (e.g., image data)
      imageData: new Array(1000).fill("x").join(""),
      timestamp: Date.now(),
    };

    await queueService.addToQueue(RequestType.LARGE, payload);

    // If in auto mode and online, process immediately
    if (!manualSync && isOnline) {
      processQueue();
    }
  }, [isOnline, manualSync, processQueue]);

  /**
   * Clear all data (for testing)
   */
  const clearAll = useCallback(async () => {
    await queueService.clearAll();
    updateState();
  }, [updateState]);

  /**
   * Retry a specific failed item
   */
  const retryFailedItem = useCallback(
    async (itemId: string) => {
      await queueService.retryFailedItem(itemId);
      updateState();
    },
    [updateState]
  );

  /**
   * Clear failed items
   */
  const clearFailedItems = useCallback(async () => {
    await queueService.clearFailedItems();
    updateState();
  }, [updateState]);

  /**
   * Manually refresh network status
   */
  const refreshNetworkStatus = useCallback(async () => {
    await syncService.refreshNetworkState();
  }, []);

  return {
    // State
    isOnline,
    stats,
    successLogs,
    pendingItems,
    failedItems,
    isProcessing,

    // Actions
    addSmallRequest,
    addLargeRequest,
    processQueue,
    retryFailedItem,
    clearAll,
    clearFailedItems,
    refreshNetworkStatus,
  };
};
