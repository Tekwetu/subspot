import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { createAppStore, createAppPersister, setupOnlineStatusTracking } from './store';

// Create a context for non-React code to access the store
const StoreContext = createContext<ReturnType<typeof createAppStore> | null>(null);

export const useStore = () => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return store;
};

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const [store, setStore] = useState<ReturnType<typeof createAppStore> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize store and persistence
    const initStore = async () => {
      try {
        const newStore = createAppStore();
        await createAppPersister(newStore);
        
        // Set up online status tracking
        const cleanup = setupOnlineStatusTracking(newStore);
        
        setStore(newStore);
        setIsLoading(false);
        
        return cleanup;
      } catch (error) {
        console.error('Failed to initialize store:', error);
        setIsLoading(false);
        return () => {};
      }
    };

    const cleanupFn = initStore();
    
    // Clean up on unmount
    return () => {
      cleanupFn.then(cleanup => cleanup());
    };
  }, []);

  if (isLoading) {
    return <div>Loading store...</div>;
  }

  if (!store) {
    return <div>Failed to initialize data store</div>;
  }

  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
}