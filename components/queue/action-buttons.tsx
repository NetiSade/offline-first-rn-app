import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { StyleSheet, TouchableOpacity } from "react-native";

interface ActionButtonsProps {
  onSmallPress: () => void;
  onLargePress: () => void;
}

export function ActionButtons({ onSmallPress, onLargePress }: ActionButtonsProps) {
  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.smallButton]}
        onPress={onSmallPress}
      >
        <ThemedText style={styles.buttonText}>SMALL</ThemedText>
        <ThemedText style={styles.buttonSubtext}>Status Update</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.largeButton]}
        onPress={onLargePress}
      >
        <ThemedText style={styles.buttonText}>LARGE</ThemedText>
        <ThemedText style={styles.buttonSubtext}>Image Upload</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  smallButton: {
    backgroundColor: "#4caf50",
  },
  largeButton: {
    backgroundColor: "#ff9800",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  buttonSubtext: {
    color: "#ffffff",
    fontSize: 12,
    opacity: 0.9,
  },
});

