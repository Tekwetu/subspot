import { useContext } from 'react';
import { StoreContext } from './StoreContextDef';

/**
 * Hook to access the TinyBase store from within React components
 * @returns The TinyBase store instance
 */
export const useStore = () => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return store;
};