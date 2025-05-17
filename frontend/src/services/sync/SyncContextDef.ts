import { createContext } from 'react';
import type { SyncManager } from './SyncManager';
import type { SyncStatus } from './types';

// Context for sync service
type SyncContextType = {
  syncManager: SyncManager;
  syncStatus: SyncStatus;
  pendingChanges: number;
  sync: () => Promise<void>;
};

export const SyncContext = createContext<SyncContextType | undefined>(undefined);