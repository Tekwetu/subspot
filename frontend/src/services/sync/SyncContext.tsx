import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { SyncManager } from './SyncManager';
import { SyncQueue } from './SyncQueue';
import { ApiClient } from './ApiClient';
import { useStore } from '../../stores/useStore';
import type { SyncConfig } from './types';
import { SyncStatus } from './types';
import { useOnlineStatusContext } from '../../hooks/useOnlineStatus/useOnlineStatusContext';
import { SyncContext } from './SyncContextDef';
import { useAuth } from '../auth/useAuth';

// Props for the provider component
type SyncProviderProps = {
  children: ReactNode;
  config?: Partial<SyncConfig>;
};

/**
 * Provider component that initializes and manages the sync service
 */
export function SyncProvider({ children, config }: SyncProviderProps) {
  const store = useStore();
  const { isOnline } = useOnlineStatusContext();
  const { token, isAuthenticated } = useAuth();
  const [syncManager, setSyncManager] = useState<SyncManager | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(SyncStatus.IDLE);
  const [pendingChanges, setPendingChanges] = useState<number>(0);

  // Initialize sync manager when store is available
  useEffect(() => {
    if (!store) return;

    const syncQueue = new SyncQueue();
    // Create API client with environmental configuration
    const apiClient = new ApiClient();

    // Set token if authenticated
    if (isAuthenticated && token) {
      apiClient.setToken(token);
    }

    // Store is properly typed using AppSchema
    const manager = new SyncManager(store, syncQueue, apiClient, config);

    // Listen for status changes
    const unsubscribe = manager.onStatusChange(setSyncStatus);

    setSyncManager(manager);
    setPendingChanges(syncQueue.size());

    // Cleanup
    return () => {
      unsubscribe();
      manager.stopAutoSync();
    };
  }, [store, config, isAuthenticated, token]);

  // Handle online/offline changes and auth status
  useEffect(() => {
    if (!syncManager) return;

    if (isOnline && isAuthenticated) {
      // Try to sync when coming back online or after authentication
      syncManager.sync().catch(console.error);
      syncManager.startAutoSync();
    } else {
      // Stop auto-sync when offline or not authenticated
      syncManager.stopAutoSync();
    }
  }, [isOnline, syncManager, isAuthenticated, token]);

  // Update token in API client when it changes
  useEffect(() => {
    if (!syncManager) return;

    // Get the apiClient using the public method
    const apiClient = syncManager.getApiClient();
    if (apiClient && apiClient.setToken) {
      apiClient.setToken(token);
    }
  }, [token, syncManager]);

  // Count pending changes periodically
  useEffect(() => {
    if (!syncManager) return;

    const interval = setInterval(() => {
      const syncQueue = new SyncQueue();
      setPendingChanges(syncQueue.size());
    }, 5000);

    return () => clearInterval(interval);
  }, [syncManager]);

  // Force a sync
  const sync = async () => {
    if (!syncManager) return;
    await syncManager.sync();
  };

  // Even if syncManager isn't initialized yet, we need to provide a context value
  // to prevent "useSyncContext must be used within a SyncProvider" error
  if (!syncManager) {
    return (
      <SyncContext.Provider
        value={{
          syncManager: null as unknown as SyncManager,
          syncStatus,
          pendingChanges,
          sync: async () => {
            /* No-op until manager is initialized */
          },
        }}
      >
        {children}
      </SyncContext.Provider>
    );
  }

  return (
    <SyncContext.Provider
      value={{
        syncManager,
        syncStatus,
        pendingChanges,
        sync,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}

// Hook moved to separate file useSyncContext.ts
