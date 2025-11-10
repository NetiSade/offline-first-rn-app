import { RequestType } from "@/types/queue.types";

/**
 * Mock API service
 * Simulates backend API calls with realistic delays and occasional failures
 */

// Configuration for the mock API
const API_CONFIG = {
  SMALL_REQUEST_DELAY: 500, // 500ms for small requests
  LARGE_REQUEST_DELAY: 2000, // 2s for large requests (simulating image upload)
  FAILURE_RATE: 0.1, // 10% chance of failure (set to 0 to disable failed tasks demo)
  // Note: Failures are EXPECTED to demonstrate the retry logic and failed tasks feature
};

/**
 * Simulates network delay
 */
const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Simulates random API failures
 */
const shouldFail = (): boolean => {
  return Math.random() < API_CONFIG.FAILURE_RATE;
};

/**
 * Mock API response interface
 */
export interface ApiResponse {
  success: boolean;
  message: string;
  timestamp: number;
}

/**
 * API Service for mock backend calls
 */
export const ApiService = {
  /**
   * Send a small request (e.g., status update, text data)
   */
  async sendSmallRequest(payload: any): Promise<ApiResponse> {
    console.log("📤 Sending SMALL request:", payload);

    // Simulate network delay
    await delay(API_CONFIG.SMALL_REQUEST_DELAY);

    // Simulate occasional failures
    if (shouldFail()) {
      console.log("❌ SMALL request failed");
      throw new Error("Network request failed");
    }

    console.log("✅ SMALL request succeeded");
    return {
      success: true,
      message: "Small request processed successfully",
      timestamp: Date.now(),
    };
  },

  /**
   * Send a large request (e.g., image upload)
   */
  async sendLargeRequest(payload: any): Promise<ApiResponse> {
    console.log("📤 Sending LARGE request:", payload);

    // Simulate network delay (longer for large requests)
    await delay(API_CONFIG.LARGE_REQUEST_DELAY);

    // Simulate occasional failures (higher chance for large requests)
    if (shouldFail()) {
      console.log("❌ LARGE request failed");
      throw new Error("Network request failed - large payload");
    }

    console.log("✅ LARGE request succeeded");
    return {
      success: true,
      message: "Large request processed successfully",
      timestamp: Date.now(),
    };
  },

  /**
   * Generic send method that routes to appropriate handler
   */
  async send(type: RequestType, payload: any): Promise<ApiResponse> {
    if (type === RequestType.SMALL) {
      return this.sendSmallRequest(payload);
    } else {
      return this.sendLargeRequest(payload);
    }
  },

  /**
   * Update failure rate for testing purposes
   */
  setFailureRate(rate: number): void {
    if (rate >= 0 && rate <= 1) {
      API_CONFIG.FAILURE_RATE = rate;
      console.log(`API failure rate set to ${rate * 100}%`);
    }
  },
};
