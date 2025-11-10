/**
 * Request type enum - used to prioritize requests
 * SMALL requests are sent before LARGE requests
 */
export enum RequestType {
  SMALL = "SMALL",
  LARGE = "LARGE",
}

/**
 * Status of a queued item
 */
export enum QueueItemStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

/**
 * Queue item structure
 */
export interface QueueItem {
  id: string;
  type: RequestType;
  payload: any;
  timestamp: number;
  retryCount: number;
  status: QueueItemStatus;
  error?: string;
}

/**
 * Success log entry - displayed on screen after successful sync
 */
export interface SuccessLog {
  id: string;
  type: RequestType;
  timestamp: number;
  completedAt: number;
}

/**
 * Network status
 */
export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
}

/**
 * Queue statistics
 */
export interface QueueStats {
  totalPending: number;
  smallPending: number;
  largePending: number;
  totalCompleted: number;
}
