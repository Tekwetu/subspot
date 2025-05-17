// Export the Provider component and hook
export { OnlineStatusProvider } from './OnlineStatusContext';
export { useOnlineStatusContext } from './useOnlineStatusContext';

// Also export the original hook for cases where we don't need the context
import { useState, useEffect } from 'react';

/**
 * Hook that tracks online/offline status of the application
 * @returns Current online status and method to force status check
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Force a manual check of online status
  const checkOnlineStatus = async (): Promise<boolean> => {
    // Try to fetch a small resource from the backend
    try {
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const online = response.ok;
      setIsOnline(online);
      return online;
    } catch {
      // Silently handle network errors by setting offline
      setIsOnline(false);
      return false;
    }
  };

  useEffect(() => {
    // Event handlers for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Listen for browser online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check on mount
    checkOnlineStatus().catch(() => setIsOnline(false));

    // Cleanup event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, checkOnlineStatus };
}