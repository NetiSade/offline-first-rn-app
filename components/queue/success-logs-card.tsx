import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SuccessLog } from "@/types/queue.types";
import { FlatList, StyleSheet } from "react-native";
import { TaskItem } from "./task-item";

interface SuccessLogsCardProps {
  logs: SuccessLog[];
}

export function SuccessLogsCard({ logs }: SuccessLogsCardProps) {
  const colorScheme = useColorScheme();

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
        Success Logs
      </ThemedText>

      <FlatList
        data={logs}
        keyExtractor={(log) => log.id}
        ListEmptyComponent={
          <ThemedText style={styles.emptyText}>
            No completed requests yet. Try adding some requests!
          </ThemedText>
        }
        renderItem={({ item }) => <TaskItem item={item} type="success" />}
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
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
    paddingVertical: 20,
  },
});

