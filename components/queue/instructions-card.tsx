import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePreferences } from "@/contexts/preferences-context";
import { StyleSheet } from "react-native";

export function InstructionsCard() {
  const colorScheme = useColorScheme();
  const { manualSync } = usePreferences();

  const instructions = manualSync
    ? '1. Enable Airplane Mode on your device\n2. Tap "Small" and "Large" buttons to queue requests\n3. Disable Airplane Mode\n4. Tap "Sync Now" button to manually sync'
    : '1. Enable Airplane Mode on your device\n2. Tap "Small" and "Large" buttons to queue requests\n3. Disable Airplane Mode to sync automatically\n4. Watch requests sync (small requests first!)';

  return (
    <ThemedView
      style={[
        styles.card,
        {
          backgroundColor: colorScheme === "dark" ? "#1a2332" : "#e3f2fd",
        },
      ]}
    >
      <ThemedText type="defaultSemiBold" style={styles.title}>
        📱 How to Test {manualSync ? "(Manual Mode)" : "(Auto Mode)"}
      </ThemedText>
      <ThemedText style={styles.text}>{instructions}</ThemedText>
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
    fontSize: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.8,
  },
});

