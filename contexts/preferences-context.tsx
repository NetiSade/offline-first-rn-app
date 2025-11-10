import { StorageService } from "@/services/storage.service";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance, ColorSchemeName } from "react-native";

/**
 * User Preferences Context
 *
 * Centralized state management for user preferences using React Context API.
 * This pattern is ideal for small-to-medium apps with shared settings across components.
 *
 * For larger applications, consider:
 * - Redux: Predictable state container with time-travel debugging
 * - MobX: Reactive state management with less boilerplate
 * - Zustand: Lightweight alternative with simpler API
 * - Recoil: Atom-based state management from Facebook
 *
 * Context API is perfect here because:
 * 1. Limited number of preferences (2-3 settings)
 * 2. Infrequent updates (user rarely changes theme/sync mode)
 * 3. No complex state derivations or side effects
 * 4. No need for middleware (logging, persistence handled separately)
 */

interface PreferencesContextType {
  // Theme preference
  colorScheme: ColorSchemeName;
  toggleTheme: () => Promise<void>;

  // Sync mode preference
  manualSync: boolean;
  setManualSync: (manual: boolean) => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined
);

export function PreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );
  const [manualSync, setManualSyncState] = useState(false);

  /**
   * Load saved preferences on mount
   */
  useEffect(() => {
    const loadPreferences = async () => {
      // Load sync mode from storage
      const savedSyncMode = await StorageService.loadSyncMode();
      setManualSyncState(savedSyncMode);

      // Load theme from storage
      const savedTheme = await StorageService.loadTheme();
      if (savedTheme) {
        Appearance.setColorScheme(savedTheme);
        setColorScheme(savedTheme);
      }
    };
    loadPreferences();

    // Listen to system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  /**
   * Toggle between light and dark theme
   */
  const toggleTheme = async () => {
    const newScheme = colorScheme === "dark" ? "light" : "dark";
    Appearance.setColorScheme(newScheme);
    setColorScheme(newScheme);
    await StorageService.saveTheme(newScheme);
  };

  /**
   * Update sync mode preference and persist to storage
   */
  const setManualSync = async (manual: boolean) => {
    setManualSyncState(manual);
    await StorageService.saveSyncMode(manual);
  };

  const value: PreferencesContextType = {
    colorScheme,
    toggleTheme,
    manualSync,
    setManualSync,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

/**
 * Hook to access user preferences
 * @throws Error if used outside PreferencesProvider
 */
export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}
