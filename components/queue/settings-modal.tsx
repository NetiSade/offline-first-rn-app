import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";

interface SettingsModalProps {
  visible: boolean;
  manualSync: boolean;
  onClose: () => void;
  onSyncModeChange: (manual: boolean) => void;
  onToggleTheme: () => void;
  onClearStorage: () => void;
}

export function SettingsModal({
  visible,
  manualSync,
  onClose,
  onSyncModeChange,
  onToggleTheme,
  onClearStorage,
}: SettingsModalProps) {
  const colorScheme = useColorScheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[
            styles.content,
            {
              backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "#ffffff",
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <ThemedText type="defaultSemiBold" style={styles.title}>
            Settings
          </ThemedText>

          {/* Sync Mode */}
          <ThemedText style={styles.sectionTitle}>Sync Mode</ThemedText>
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                styles.segmentButtonLeft,
                !manualSync && styles.segmentButtonActive,
                { borderColor: colorScheme === "dark" ? "#444" : "#ccc" },
              ]}
              onPress={() => onSyncModeChange(false)}
            >
              <ThemedText
                style={[
                  styles.segmentButtonText,
                  !manualSync && styles.segmentButtonTextActive,
                ]}
              >
                🚀 Auto
              </ThemedText>
              <ThemedText
                style={[
                  styles.segmentButtonSubtext,
                  !manualSync && styles.segmentButtonSubtextActive,
                ]}
              >
                Syncs automatically
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                styles.segmentButtonRight,
                manualSync && styles.segmentButtonActive,
                { borderColor: colorScheme === "dark" ? "#444" : "#ccc" },
              ]}
              onPress={() => onSyncModeChange(true)}
            >
              <ThemedText
                style={[
                  styles.segmentButtonText,
                  manualSync && styles.segmentButtonTextActive,
                ]}
              >
                👆 Manual
              </ThemedText>
              <ThemedText
                style={[
                  styles.segmentButtonSubtext,
                  manualSync && styles.segmentButtonSubtextActive,
                ]}
              >
                Tap to sync
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colorScheme === "dark" ? "#333" : "#e0e0e0",
              },
            ]}
          />

          <TouchableOpacity style={styles.settingItem} onPress={onToggleTheme}>
            <ThemedText style={styles.settingText}>🌓 Toggle Theme</ThemedText>
            <ThemedText style={styles.settingValue}>
              {colorScheme === "dark" ? "Dark" : "Light"}
            </ThemedText>
          </TouchableOpacity>

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colorScheme === "dark" ? "#333" : "#e0e0e0",
              },
            ]}
          />

          <TouchableOpacity style={styles.settingItem} onPress={onClearStorage}>
            <ThemedText style={styles.settingText}>🗑️ Clear Storage</ThemedText>
            <ThemedText style={styles.settingDanger}>Delete all</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <ThemedText style={styles.closeButtonText}>Close</ThemedText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "85%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    opacity: 0.7,
  },
  segmentedControl: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  segmentButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  segmentButtonLeft: {
    marginRight: 6,
  },
  segmentButtonRight: {
    marginLeft: 6,
  },
  segmentButtonActive: {
    backgroundColor: "#2196f3",
    borderColor: "#2196f3",
  },
  segmentButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  segmentButtonTextActive: {
    color: "#ffffff",
  },
  segmentButtonSubtext: {
    fontSize: 11,
    opacity: 0.6,
  },
  segmentButtonSubtextActive: {
    color: "#ffffff",
    opacity: 0.9,
  },
  divider: {
    height: 1,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  settingText: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 14,
    opacity: 0.7,
  },
  settingDanger: {
    fontSize: 14,
    color: "#ff6b6b",
  },
  closeButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#2196f3",
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

