import { useContext } from 'react';
import { SyncContext } from './SyncContextDef';

/**
 * Hook to access the sync context in components
 */
export function useSyncContext() {
  const context = useContext(SyncContext);

  if (context === undefined) {
    throw new Error('useSyncContext must be used within a SyncProvider');
  }

  return context;
}
