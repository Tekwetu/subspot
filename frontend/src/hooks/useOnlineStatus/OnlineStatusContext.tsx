import type { ReactNode } from 'react';
import { useOnlineStatus } from '.';
import { OnlineStatusContext } from './OnlineStatusContextDef';

type OnlineStatusProviderProps = {
  children: ReactNode;
};

/**
 * Provider component that makes online status available throughout the app
 */
export function OnlineStatusProvider({ children }: OnlineStatusProviderProps) {
  const onlineStatus = useOnlineStatus();

  return (
    <OnlineStatusContext.Provider value={onlineStatus}>{children}</OnlineStatusContext.Provider>
  );
}
