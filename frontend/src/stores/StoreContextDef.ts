import { createContext } from 'react';
import type { createAppStore } from './store';

// Create a context for non-React code to access the store
export const StoreContext = createContext<ReturnType<typeof createAppStore> | null>(null);