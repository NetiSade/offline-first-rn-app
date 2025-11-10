import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { QueueItem } from "@/types/queue.types";
import { FlatList, StyleSheet } from "react-native";
import { TaskItem } from "./task-item";

interface PendingQueueCardProps {
  items: QueueItem[];
}

export function PendingQueueCard({ items }: PendingQueueCardProps) {
  const colorScheme = useColorScheme();

  if (items.length === 0) return null;

  return (
    <ThemedView
      style={[
        styles.card,
        {
          backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "#e8f5e9",
        },
      ]}
    >
      <ThemedText type="defaultSemiBold" style={styles.title}>
        📋 Pending Queue
      </ThemedText>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TaskItem item={item} type="pending" />}
        scrollEnabled={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#4caf50",
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
  },
});

