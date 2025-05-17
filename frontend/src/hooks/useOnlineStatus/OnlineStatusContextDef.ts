import { createContext } from 'react';

// Define the context type
type OnlineStatusContextType = {
  isOnline: boolean;
  checkOnlineStatus: () => Promise<boolean>;
};

// Create context with default values
export const OnlineStatusContext = createContext<OnlineStatusContextType>({
  isOnline: true,
  checkOnlineStatus: async () => true,
});
