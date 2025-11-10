import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { queueService } from "./queue.service";
import { StorageService } from "./storage.service";

/**
 * Sync Service
 * Monitors network connectivity and automatically syncs queue when connection is restored
 */
export class SyncService {
  private isOnline: boolean = true;
  private unsubscribeNetInfo?: () => void;
  private networkListeners: ((isOnline: boolean) => void)[] = [];
  private manualSync: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize network monitoring
   */
  private async initialize(): Promise<void> {
    // Load saved sync mode preference first
    this.manualSync = await StorageService.loadSyncMode();
    console.log(`Loaded sync mode: ${this.manualSync ? "MANUAL" : "AUTO"}`);

    // Get initial network state
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected ?? false;

    console.log(
      `Initial network state: ${this.isOnline ? "ONLINE" : "OFFLINE"}`
    );

    // Subscribe to network state changes
    this.unsubscribeNetInfo = NetInfo.addEventListener(
      (state: NetInfoState) => {
        this.handleNetworkChange(state);
      }
    );

    // If we're online at startup and in auto mode, process any pending items
    // This handles the case where app was restarted with pending items
    if (this.isOnline && !this.manualSync) {
      // Small delay to ensure queue is fully initialized
      setTimeout(() => {
        const stats = queueService.getStats();
        if (stats.totalPending > 0) {
          console.log(
            "🔄 App started online with pending items - triggering auto-sync"
          );
          this.triggerSync();
        }
      }, 100);
    }
  }

  /**
   * Handle network state changes
   */
  private handleNetworkChange(state: NetInfoState): void {
    const wasOnline = this.isOnline;
    this.isOnline = state.isConnected ?? false;

    console.log(
      `Network state changed: ${this.isOnline ? "ONLINE" : "OFFLINE"}`
    );

    // Notify listeners
    this.notifyNetworkListeners(this.isOnline);

    // If we just came online, try to sync the queue (only if in auto mode)
    if (!wasOnline && this.isOnline) {
      if (!this.manualSync) {
        console.log("🌐 Connection restored - starting auto-sync");
        this.triggerSync();
      } else {
        console.log("🌐 Connection restored - waiting for manual sync");
      }
    }
  }

  /**
   * Trigger queue synchronization
   */
  async triggerSync(): Promise<void> {
    if (!this.isOnline) {
      console.log("Cannot sync - device is offline");
      return;
    }

    console.log("Starting sync...");

    try {
      await queueService.processQueue();
      console.log("Sync completed successfully");
    } catch (error) {
      console.error("Sync failed:", error);
    }
  }

  /**
   * Get current online status
   */
  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Set manual sync mode
   * @param manualSync - If true, requires manual sync; if false, auto-syncs
   */
  setManualSyncMode(manualSync: boolean): void {
    if (this.manualSync !== manualSync) {
      this.manualSync = manualSync;
      console.log(`Sync mode changed to: ${manualSync ? "MANUAL" : "AUTO"}`);
    }
  }

  /**
   * Subscribe to network status changes
   */
  subscribeToNetworkChanges(listener: (isOnline: boolean) => void): () => void {
    this.networkListeners.push(listener);

    // Immediately call with current status
    listener(this.isOnline);

    // Return unsubscribe function
    return () => {
      this.networkListeners = this.networkListeners.filter(
        (l) => l !== listener
      );
    };
  }

  /**
   * Notify all network listeners
   */
  private notifyNetworkListeners(isOnline: boolean): void {
    this.networkListeners.forEach((listener) => listener(isOnline));
  }

  /**
   * Manually refresh network state
   */
  async refreshNetworkState(): Promise<void> {
    const state = await NetInfo.fetch();
    this.handleNetworkChange(state);
  }

  /**
   * Cleanup - unsubscribe from network monitoring
   */
  cleanup(): void {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
    }
  }
}

// Singleton instance
export const syncService = new SyncService();
