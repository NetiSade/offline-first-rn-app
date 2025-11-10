/**
 * Utility functions for formatting data
 */

/**
 * Format timestamp to readable date/time
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted string with time and date
 */
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString() + " " + date.toLocaleDateString();
};

/**
 * Calculate time taken between two timestamps
 * @param startTimestamp - Start time in milliseconds
 * @param endTimestamp - End time in milliseconds
 * @returns Formatted string with seconds (e.g., "3s")
 */
export const getTimeTaken = (startTimestamp: number, endTimestamp: number): string => {
  const seconds = Math.round((endTimestamp - startTimestamp) / 1000);
  return `${seconds}s`;
};

