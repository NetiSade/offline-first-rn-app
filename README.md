# Offline-First React Native App

A demonstration of an offline-first mobile application built for Package.AI, showcasing queue management, request prioritization, and automatic synchronization when connectivity is restored.

## 🎯 Overview

This app simulates a delivery driver's mobile application that continues to work seamlessly even in areas with poor or no cellular reception. All user actions are queued locally and automatically synced to the backend when connectivity is restored, with intelligent prioritization of small requests over large ones.

## ✨ Features

- **Offline-First Architecture**: All actions work immediately, even when offline
- **Request Prioritization**: Small requests (status updates) are sent before large requests (image uploads)
- **Flexible Sync Modes**: Segmented control to switch between automatic and manual sync modes
- **Persistent Storage**: All queued actions persist between app restarts using AsyncStorage
- **Exponential Backoff**: Smart retry mechanism with exponential backoff for failed requests
- **Real-time Status**: Network status indicator and live queue statistics
- **Success Logs**: Visual log of all successfully synced requests with timestamps
- **Dark Mode Support**: Full support for light and dark themes
- **Pending Queue View**: Real-time view of pending tasks with processing status
- **Intuitive UI**: Clear, tappable buttons with visual feedback for all actions

## 🚀 How to Run

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator, or physical device with Expo Go app

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

3. Run on your preferred platform:

```bash
# iOS (Mac only)
npm run ios

# Android
npm run android

# Web (for quick testing)
npm run web
```

## 📱 How to Test

### Auto Mode (Default - Recommended)

1. **Launch the app** on your device or simulator
2. **Verify** you're in Auto mode (tap ⋮ menu to check - "🚀 Auto" should be selected)
3. **Enable Airplane Mode** to simulate offline conditions
4. **Tap the "SMALL" and "LARGE" buttons** to queue requests
5. **Observe** the pending queue updating in real-time
6. **Disable Airplane Mode** to restore connectivity
7. **Watch** as the app automatically syncs all pending requests
8. **Notice** small requests are processed first, followed by large requests
9. **View** the success logs with timestamps
10. **Close and reopen the app** to verify persistence

### Manual Mode

1. **Tap the ⋮ button** in the top-right corner to open Settings
2. **Select "👆 Manual"** mode in the Sync Mode section
3. **Close** the settings menu
4. **Enable Airplane Mode** and add requests
5. **Disable Airplane Mode** - requests will NOT auto-sync
6. **Tap "Sync Now"** button to manually trigger synchronization
7. **Open Settings** and switch back to Auto Mode to see immediate sync

### Settings Menu

Tap the **⋮ button** in the top-right corner to access:
- **Sync Mode**: Toggle between Auto and Manual sync
- **Toggle Theme**: Switch between Light and Dark mode
- **Clear Storage**: Delete all queued requests and success logs

## 🏗️ Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                         React UI Layer                       │
│              (index.tsx + useOfflineQueue hook)              │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────────┐
│                      Service Layer                           │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ SyncService  │  │ QueueService │  │  ApiService  │      │
│  │   (Network   │  │  (Priority   │  │   (Mock      │      │
│  │  Monitoring) │  │   Queue)     │  │   Backend)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                           │                                   │
│                    ┌──────┴───────┐                          │
│                    │ StorageService│                          │
│                    │  (AsyncStorage)│                         │
│                    └───────────────┘                          │
└──────────────────────────────────────────────────────────────┘
```

### Core Components

#### 1. **Types** (`types/queue.types.ts`)

- Defines TypeScript interfaces for queue items, success logs, and status enums
- Ensures type safety across the application

#### 2. **Storage Service** (`services/storage.service.ts`)

- Handles all AsyncStorage operations
- Persists queue and success logs
- Provides atomic operations to prevent data corruption

#### 3. **API Service** (`services/api.service.ts`)

- Mocks backend API endpoints
- Simulates realistic network delays:
  - Small requests: 500ms
  - Large requests: 2000ms (simulating image upload)
- Configurable failure rate (10% by default)

#### 4. **Queue Service** (`services/queue.service.ts`)

- Manages the offline queue with priority handling
- Implements request prioritization (small → large)
- Handles retry logic with exponential backoff:
  - Initial backoff: 1 second
  - Max backoff: 10 seconds
  - Max retries: 3 attempts
- Provides queue statistics and success logs
- Notifies subscribers of queue changes

#### 5. **Sync Service** (`services/sync.service.ts`)

- Monitors network connectivity using NetInfo
- Automatically triggers sync when connection is restored
- Provides network status to UI components

#### 6. **Custom Hook** (`hooks/use-offline-queue.ts`)

- Provides clean React interface to queue functionality
- Manages component state and subscriptions
- Offers convenient methods for adding requests and processing queue

#### 7. **Utilities** (`utils/format.utils.ts`)

- Reusable formatting functions for dates and timestamps
- Keeps UI components clean and focused
- Improves code maintainability and testability

#### 8. **UI** (`app/index.tsx`)

- Clean, functional interface focusing on core features
- Settings menu (⋮ button) for app configuration
- Sync mode selector (Auto/Manual) in settings
- Theme toggle (Light/Dark) in settings
- Clear storage option in settings
- Real-time network status indicator (sticky header)
- Queue statistics dashboard
- Pending queue view with live processing status
- Success logs with timestamps and task IDs
- Large, easy-to-tap action buttons
- Full dark mode support throughout

### Request Flow

```
User Action (Tap Small/Large Button)
    ↓
Add to Queue (in-memory)
    ↓
Persist to AsyncStorage
    ↓
Check Network Status
    ↓
┌───────────┴───────────┐
│ ONLINE                │ OFFLINE
│   ↓                   │   ↓
│ Process Queue         │ Wait for connection
│   ↓                   │   ↓
│ 1. Small requests     │ Monitor network
│ 2. Large requests     │   ↓
│   ↓                   │ Connection restored
│ Success!              │   ↓
│   ↓                   │ Auto-sync triggered
│ Log to UI             │   ↓
└───────────────────────┴─→ Process Queue
```

### Priority Queue Algorithm

```typescript
1. Filter pending items from queue
2. Separate into two arrays: [small_requests, large_requests]
3. Sort each array by timestamp (FIFO within priority)
4. Process: [...small_requests, ...large_requests]
5. For each item:
   - Send to API
   - If success: Remove from queue, add to logs
   - If failure: Increment retry count
     - If retries < max: Apply exponential backoff, retry
     - If retries >= max: Mark as failed, keep in queue
```

## 🎨 Design Decisions

### 1. **AsyncStorage over SQLite**

- **Rationale**: Simpler setup, sufficient for demo purposes
- **Trade-off**: SQLite would be better for production with larger datasets
- **Benefit**: Zero native dependencies, works out of the box

### 2. **In-Memory + Persistent Queue**

- **Rationale**: Fast access with guaranteed persistence
- **Implementation**: Queue stored in-memory, synced to AsyncStorage on every change
- **Benefit**: Best performance while ensuring data survives app restarts

### 3. **Exponential Backoff Retry**

- **Rationale**: Prevents overwhelming the network/backend
- **Parameters**: 1s → 2s → 4s (with 10s cap)
- **Benefit**: Graceful handling of temporary network issues

### 4. **Separate Small/Large Queues (Logical)**

- **Rationale**: Prioritize time-sensitive small requests
- **Implementation**: Single queue, sorted by priority at processing time
- **Benefit**: Simpler code, maintains order within priority levels

### 5. **Mock API with Configurable Failures**

- **Rationale**: Realistic testing without backend dependency
- **Features**: Adjustable delays and failure rates
- **Benefit**: Easy to test various network conditions

### 6. **Observer Pattern for UI Updates**

- **Rationale**: Clean separation between services and UI
- **Implementation**: Services notify subscribers of changes
- **Benefit**: React components automatically re-render on state changes

## 🧪 Testing Scenarios

### Basic Functionality

- ✅ Add small request → Appears in queue
- ✅ Add large request → Appears in queue
- ✅ Online sync → Requests processed in correct order

### Offline Scenarios

- ✅ Offline → Small request → Stays in queue
- ✅ Offline → Large request → Stays in queue
- ✅ Multiple offline requests → All queued correctly

### Sync Scenarios

- ✅ Go online → Auto-sync triggered
- ✅ Small requests processed before large requests
- ✅ Failed requests retry with backoff
- ✅ Success logs updated after completion

### Persistence

- ✅ Queue persists after app restart
- ✅ Success logs persist after app restart
- ✅ Network state detected on app launch

## 📊 Configuration

### Sync Mode (Settings Menu)

Access the **Settings menu** (⋮ button in top-right) to switch between sync modes in real-time - no code changes needed!

**🚀 Auto Mode (Default):**

- ✅ Requests sent immediately when online
- ✅ Queued when offline
- ✅ Auto-sync when connection restored (offline → online)
- ✅ No manual "Sync Now" button (handled automatically)
- **Best for:** Production use, delivery driver apps, seamless UX
- **How to access:** Settings → Sync Mode → Select "🚀 Auto"

**👆 Manual Mode:**

- ✅ Requests sent immediately when online
- ✅ Queued when offline
- ❌ NO auto-sync when connection restored
- ✅ "Sync Now" button appears to manually trigger sync
- **Best for:** User control, testing, demo purposes
- **How to access:** Settings → Sync Mode → Select "👆 Manual"

**Note:** Both modes send requests immediately when already online. The mode selection only affects behavior when transitioning from offline to online.

### API Settings (Optional)

Edit `services/api.service.ts` to adjust mock API behavior:

```typescript
const API_CONFIG = {
  SMALL_REQUEST_DELAY: 500, // Delay for small requests (ms)
  LARGE_REQUEST_DELAY: 2000, // Delay for large requests (ms - simulates image upload)
  FAILURE_RATE: 0, // API failure rate (0 = disabled, 0.1 = 10% chance)
};
```

**Note:** FAILURE_RATE is set to 0 by default. Set to 0.1 to simulate network failures and test retry logic.

### Retry Settings (Optional)

Edit `services/queue.service.ts` to adjust retry behavior:

```typescript
const RETRY_CONFIG = {
  MAX_RETRIES: 3, // Maximum retry attempts per request
  INITIAL_BACKOFF_MS: 1000, // Initial backoff delay (1 second)
  MAX_BACKOFF_MS: 10000, // Maximum backoff delay (10 seconds)
};
```

**Note:** Exponential backoff: 1s → 2s → 4s → 8s (capped at 10s)

## 🔧 Troubleshooting

### Network status not updating

- Ensure you've granted network permissions to the app
- Network status updates automatically when connection changes
- On iOS simulator: **Hardware → Network Link Conditioner** or **Features → Airplane Mode**
- On Android emulator: Use the network toggle in extended controls

### Requests not syncing automatically

- Verify you're in **Auto Mode** (toggle should be OFF)
- Check console logs for errors
- Ensure device has internet connectivity
- Try toggling Airplane Mode off/on

### Requests not syncing manually

- Verify you're in **Manual Mode** (toggle should be ON)
- Ensure "Sync Now" button is visible (only shows when online with pending items)
- Check console for error messages

### App crashes on startup

- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Metro cache: `npm start -- --clear`
- Clear app data on device/simulator and restart

## ✅ Key Features Implemented

- ✅ Offline-first queue with persistence
- ✅ Priority-based request processing (small → large)
- ✅ Exponential backoff retry mechanism
- ✅ Automatic and manual sync modes
- ✅ Real-time UI updates with observer pattern
- ✅ Network connectivity monitoring
- ✅ AsyncStorage for persistent state
- ✅ Dark mode support
- ✅ Task status tracking (pending, processing, completed)
- ✅ Success logs with timestamps and task IDs

## 📝 Future Enhancements

- [ ] SQLite for better performance with large queues
- [ ] Request deduplication to prevent duplicate submissions
- [ ] Multiple priority levels (urgent, normal, low)
- [ ] Background sync using background tasks API
- [ ] Conflict resolution for concurrent edits
- [ ] Batch API calls for improved efficiency
- [ ] Queue size limits and overflow handling
- [ ] Advanced retry strategies (circuit breaker, jitter)
- [ ] Analytics and monitoring dashboard
- [ ] Offline data caching and preloading

## 🏢 Project Structure

```
offline-first-rn-app/
├── app/
│   ├── _layout.tsx             # Root layout with theme provider
│   └── index.tsx               # Main screen
├── components/
│   ├── themed-text.tsx         # Themed text component
│   ├── themed-view.tsx         # Themed view component
│   └── queue/                  # Queue UI components (modular & reusable)
│       ├── action-buttons.tsx  # SMALL/LARGE task buttons
│       ├── failed-tasks-card.tsx # Failed tasks with retry
│       ├── instructions-card.tsx # How to test instructions
│       ├── pending-queue-card.tsx # Pending tasks display
│       ├── queue-stats-card.tsx # Queue statistics & sync button
│       ├── settings-modal.tsx  # Settings modal dialog
│       ├── status-card.tsx     # Network status indicator
│       ├── success-logs-card.tsx # Success logs display
│       └── task-item.tsx       # Reusable task item component
├── hooks/
│   └── use-offline-queue.ts    # Custom hook for queue operations
├── services/
│   ├── api.service.ts          # Mock API with configurable delays
│   ├── queue.service.ts        # Queue management & retry logic
│   ├── storage.service.ts      # AsyncStorage wrapper
│   └── sync.service.ts         # Network monitoring & sync
├── types/
│   └── queue.types.ts          # TypeScript interfaces
├── utils/
│   └── format.utils.ts         # Formatting utility functions
├── package.json
└── README.md
```

## 👤 Author

Built as a technical assignment for Package.AI

## 📄 License

MIT
