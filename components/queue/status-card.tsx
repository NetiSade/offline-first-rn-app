import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { StyleSheet, View } from "react-native";

interface StatusCardProps {
  isOnline: boolean;
}

export function StatusCard({ isOnline }: StatusCardProps) {
  const colorScheme = useColorScheme();

  return (
    <ThemedView
      style={[
        styles.statusCard,
        {
          backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#f9f9f9",
          borderBottomColor: colorScheme === "dark" ? "#333" : "#e0e0e0",
        },
      ]}
    >
      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusIndicator,
            isOnline ? styles.online : styles.offline,
          ]}
        />
        <ThemedText type="defaultSemiBold" style={styles.statusText}>
          {isOnline ? "ONLINE" : "OFFLINE"}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  online: {
    backgroundColor: "#4caf50",
  },
  offline: {
    backgroundColor: "#f44336",
  },
  statusText: {
    fontSize: 16,
  },
});

