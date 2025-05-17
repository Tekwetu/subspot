import { useContext } from 'react';
import { OnlineStatusContext } from './OnlineStatusContextDef';

/**
 * Hook to consume the online status context in any component
 */
export function useOnlineStatusContext() {
  const context = useContext(OnlineStatusContext);
  
  if (context === undefined) {
    throw new Error('useOnlineStatusContext must be used within an OnlineStatusProvider');
  }
  
  return context;
}