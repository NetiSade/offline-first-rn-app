import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { QueueItem } from "@/types/queue.types";
import { FlatList, StyleSheet } from "react-native";
import { TaskItem } from "./task-item";

interface FailedTasksCardProps {
  items: QueueItem[];
  onRetry: (id: string) => void;
}

export function FailedTasksCard({ items, onRetry }: FailedTasksCardProps) {
  const colorScheme = useColorScheme();

  if (items.length === 0) return null;

  return (
    <ThemedView
      style={[
        styles.card,
        {
          backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "#ffebee",
        },
      ]}
    >
      <ThemedText type="defaultSemiBold" style={styles.title}>
        ❌ Failed Tasks
      </ThemedText>
      <ThemedText style={styles.description}>
        These tasks failed after 3 retry attempts. Tap &quot;Retry&quot; to try
        again.
      </ThemedText>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem item={item} type="failed" onRetry={onRetry} />
        )}
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
    borderColor: "#f44336",
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
    marginTop: 4,
  },
});

