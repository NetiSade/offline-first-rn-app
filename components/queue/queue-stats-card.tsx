import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePreferences } from "@/contexts/preferences-context";
import { QueueStats } from "@/types/queue.types";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface QueueStatsCardProps {
  stats: QueueStats;
  isOnline: boolean;
  isProcessing: boolean;
  onSyncPress: () => void;
}

export function QueueStatsCard({
  stats,
  isOnline,
  isProcessing,
  onSyncPress,
}: QueueStatsCardProps) {
  const colorScheme = useColorScheme();
  const { manualSync } = usePreferences();

  return (
    <ThemedView
      style={[
        styles.card,
        {
          backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "#f5f5f5",
        },
      ]}
    >
      <ThemedText type="defaultSemiBold" style={styles.title}>
        Queue Status
      </ThemedText>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>{stats.smallPending}</ThemedText>
          <ThemedText style={styles.statLabel}>Small Pending</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>{stats.largePending}</ThemedText>
          <ThemedText style={styles.statLabel}>Large Pending</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>{stats.totalCompleted}</ThemedText>
          <ThemedText style={styles.statLabel}>Completed</ThemedText>
        </View>
      </View>

      {manualSync && stats.totalPending > 0 && isOnline && (
        <TouchableOpacity
          style={[styles.syncButton, isProcessing && styles.syncButtonDisabled]}
          onPress={onSyncPress}
          disabled={isProcessing}
        >
          <ThemedText style={styles.syncButtonText}>
            {isProcessing ? "Processing..." : "Sync Now"}
          </ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    opacity: 0.6,
    textAlign: "center",
  },
  syncButton: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#2196f3",
    alignItems: "center",
  },
  syncButtonDisabled: {
    backgroundColor: "#ccc",
  },
  syncButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});

