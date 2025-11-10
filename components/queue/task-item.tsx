import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { QueueItem, QueueItemStatus, RequestType, SuccessLog } from "@/types/queue.types";
import { formatTimestamp, getTimeTaken } from "@/utils/format.utils";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface TaskItemProps {
  item: QueueItem | SuccessLog;
  type: "pending" | "failed" | "success";
  onRetry?: (id: string) => void;
}

export function TaskItem({ item, type, onRetry }: TaskItemProps) {
  const colorScheme = useColorScheme();

  const isPending = type === "pending";
  const isFailed = type === "failed";
  const isSuccess = type === "success";
  const queueItem = item as QueueItem;
  const successLog = item as SuccessLog;

  return (
    <ThemedView
      style={[
        styles.item,
        {
          backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "white",
        },
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.badge,
            item.type === RequestType.SMALL ? styles.smallBadge : styles.largeBadge,
          ]}
        >
          <ThemedText style={styles.badgeText}>{item.type}</ThemedText>
        </View>

        {isPending && queueItem.status === QueueItemStatus.PROCESSING && (
          <ThemedText style={[styles.statusBadge, styles.processingStatus]}>
            IN PROGRESS
          </ThemedText>
        )}

        {isFailed && (
          <ThemedText style={[styles.statusBadge, styles.failedStatus]}>
            FAILED
          </ThemedText>
        )}

        {isSuccess && (
          <ThemedText style={styles.time}>
            {getTimeTaken(successLog.timestamp, successLog.completedAt)}
          </ThemedText>
        )}
      </View>

      {isPending && (
        <ThemedText style={styles.timestamp}>
          {queueItem.status === QueueItemStatus.PROCESSING
            ? "🔄 In progress..."
            : "⏸️ Waiting for sync..."}
        </ThemedText>
      )}

      {isFailed && (
        <>
          <ThemedText style={styles.timestamp}>
            ⚠️ Failed after {queueItem.retryCount} attempts
          </ThemedText>
          {queueItem.error && (
            <ThemedText style={styles.errorText}>
              Error: {queueItem.error}
            </ThemedText>
          )}
        </>
      )}

      {isSuccess && (
        <ThemedText style={styles.timestamp}>
          ✅ Completed: {formatTimestamp(successLog.completedAt)}
        </ThemedText>
      )}

      <ThemedText style={styles.timestampSecondary}>
        📤 Created: {formatTimestamp(item.timestamp)}
      </ThemedText>

      <ThemedText style={styles.taskId}>ID: {item.id}</ThemedText>

      {isFailed && onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => onRetry(item.id)}
        >
          <ThemedText style={styles.retryButtonText}>🔄 Retry</ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  smallBadge: {
    backgroundColor: "#4caf50",
  },
  largeBadge: {
    backgroundColor: "#ff9800",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  processingStatus: {
    backgroundColor: "#9c27b0",
    color: "#ffffff",
  },
  failedStatus: {
    backgroundColor: "#f44336",
    color: "#ffffff",
  },
  time: {
    fontSize: 12,
    fontWeight: "600",
  },
  timestamp: {
    fontSize: 13,
    marginBottom: 4,
  },
  timestampSecondary: {
    fontSize: 12,
    opacity: 0.7,
  },
  errorText: {
    fontSize: 12,
    color: "#f44336",
    marginTop: 4,
    marginBottom: 4,
    fontStyle: "italic",
  },
  taskId: {
    fontSize: 10,
    opacity: 0.5,
    marginTop: 4,
    fontFamily: "monospace",
  },
  retryButton: {
    backgroundColor: "#2196f3",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});

