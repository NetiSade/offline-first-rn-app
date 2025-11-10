import { ActionButtons } from "@/components/queue/action-buttons";
import { FailedTasksCard } from "@/components/queue/failed-tasks-card";
import { InstructionsCard } from "@/components/queue/instructions-card";
import { PendingQueueCard } from "@/components/queue/pending-queue-card";
import { QueueStatsCard } from "@/components/queue/queue-stats-card";
import { SettingsModal } from "@/components/queue/settings-modal";
import { StatusCard } from "@/components/queue/status-card";
import { SuccessLogsCard } from "@/components/queue/success-logs-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { usePreferences } from "@/contexts/preferences-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useOfflineQueue } from "@/hooks/use-offline-queue";
import { StorageService } from "@/services/storage.service";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const { manualSync, setManualSync, toggleTheme } = usePreferences();

  const {
    isOnline,
    stats,
    successLogs,
    pendingItems,
    failedItems,
    isProcessing,
    addSmallRequest,
    addLargeRequest,
    processQueue,
    retryFailedItem,
    clearAll,
  } = useOfflineQueue(manualSync);

  const handleCloseSettings = () => {
    setSettingsVisible(false);
  };

  const handleToggleTheme = async () => {
    await toggleTheme();
    handleCloseSettings();
  };

  const handleClearStorage = async () => {
    await StorageService.clearAll();
    clearAll();
    await setManualSync(false); // Reset to auto mode
    // Theme will reset to system default on next app restart
    handleCloseSettings();
  };

  const handleSyncModeChange = async (manual: boolean) => {
    await setManualSync(manual);
    handleCloseSettings();
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView
        style={[
          styles.header,
          { borderBottomColor: colorScheme === "dark" ? "#333" : "#e0e0e0" },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <ThemedText type="title" style={styles.title}>
              Offline-First Demo
            </ThemedText>
            <ThemedText type="subtitle" style={styles.subtitle}>
              Package.AI Assignment
            </ThemedText>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setSettingsVisible(true)}
          >
            <ThemedText style={styles.settingsIcon}>⋮</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* Network Status */}
      <StatusCard isOnline={isOnline} />

      {/* Main Content */}
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.content}>
          <InstructionsCard />

          <ActionButtons
            onSmallPress={addSmallRequest}
            onLargePress={addLargeRequest}
          />

          <QueueStatsCard
            stats={stats}
            isOnline={isOnline}
            isProcessing={isProcessing}
            onSyncPress={processQueue}
          />

          <PendingQueueCard items={pendingItems} />

          <FailedTasksCard items={failedItems} onRetry={retryFailedItem} />

          <SuccessLogsCard logs={successLogs} />

          <ThemedView style={styles.footer}>
            <ThemedText style={styles.footerText}>
              All actions persist between app restarts
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>

      <SettingsModal
        visible={settingsVisible}
        onClose={handleCloseSettings}
        onSyncModeChange={handleSyncModeChange}
        onToggleTheme={handleToggleTheme}
        onClearStorage={handleClearStorage}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
  },
  settingsButton: {
    position: "absolute",
    right: 0,
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    opacity: 0.5,
    fontStyle: "italic",
  },
});
