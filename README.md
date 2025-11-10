# Offline-First React Native App

A delivery driver mobile app that works seamlessly without network connectivity. Actions are queued locally and automatically synced when connection is restored, with smart prioritization (small requests before large).

## Features

- **Offline-First**: Works immediately, even offline
- **Smart Prioritization**: Small requests (status updates) before large (image uploads)
- **Persistent Storage**: Queue survives app restarts
- **Auto/Manual Sync Modes**: Toggle via settings menu (⋮)
- **Exponential Backoff**: 3 retry attempts with increasing delays
- **Failed Task Recovery**: Manually retry failed tasks
- **Dark Mode**: Full theme support

## Quick Start

```bash
npm install
npm start
# Then: npm run ios / npm run android / npm run web
```

## Testing

### Basic Flow

1. Enable **Airplane Mode**
2. Tap **SMALL** and **LARGE** buttons to add tasks
3. Observe tasks queued in "Pending Queue"
4. Disable **Airplane Mode**
5. Watch auto-sync (small tasks first!)
6. Check "Success Logs" for completed tasks

### Manual Mode

- Open **Settings** (⋮) → Select **Manual** mode
- Add tasks while offline
- Go online → Tap **"Sync Now"** to manually trigger sync

### Testing Failures

- Set `FAILURE_RATE: 0.3` in `services/api.service.ts` (line 12)
- Tasks will fail and show in "Failed Tasks" section
- Tap **"Retry"** on failed items

## Architecture

```
UI Layer (React Components)
    ↓
useOfflineQueue Hook
    ↓
Services Layer:
  ├─ QueueService    (priority queue, retry logic)
  ├─ SyncService     (network monitoring)
  ├─ StorageService  (AsyncStorage persistence)
  └─ ApiService      (mock backend with delays)
```

### Key Technical Points

**Queue Processing:**

- Single processing loop that re-checks priority after each item
- Allows new high-priority tasks to jump the queue
- Items stuck in PROCESSING state are reset to PENDING on app restart

**Retry Logic:**

- Max 3 attempts with exponential backoff: 1s → 2s → 4s (max 10s)
- Failed items stay in queue until manually retried
- All state persists via AsyncStorage

**Priority Algorithm:**

```typescript
getPendingItems() {
  const small = queue.filter(SMALL).sort(byTimestamp);
  const large = queue.filter(LARGE).sort(byTimestamp);
  return [...small, ...large];
}
```

## Project Structure

```
app/
  └── index.tsx               # Main screen (183 lines)
components/queue/             # Modular UI components
  ├── action-buttons.tsx
  ├── failed-tasks-card.tsx
  ├── pending-queue-card.tsx
  ├── queue-stats-card.tsx
  ├── settings-modal.tsx
  └── task-item.tsx          # Reusable across all lists
services/
  ├── api.service.ts         # Mock API (delays: 500ms/2s)
  ├── queue.service.ts       # Queue + retry logic
  ├── storage.service.ts     # AsyncStorage wrapper
  └── sync.service.ts        # Network monitoring
hooks/
  └── use-offline-queue.ts   # React interface to services
types/
  └── queue.types.ts         # TypeScript interfaces
utils/
  └── format.utils.ts        # Date/time formatting
```

## Configuration

### Sync Modes (in app settings ⋮)

- **Auto** (default): Syncs automatically when online
- **Manual**: Requires "Sync Now" button press

### API Behavior (`services/api.service.ts`)

```typescript
FAILURE_RATE: 0; // 0 = no failures, 0.3 = 30% failure rate
SMALL_REQUEST_DELAY: 500;
LARGE_REQUEST_DELAY: 2000;
```

### Retry Behavior (`services/queue.service.ts`)

```typescript
MAX_RETRIES: 3;
INITIAL_BACKOFF_MS: 1000;
MAX_BACKOFF_MS: 10000;
```

---

Built for Package.AI technical assignment
