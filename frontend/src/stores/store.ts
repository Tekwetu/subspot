import { createStore } from 'tinybase/with-schemas';
import { createLocalPersister } from 'tinybase/persisters/persister-browser';
import { tablesSchema, valuesSchema } from './schema';
import type { Store } from 'tinybase';

// Create a typed store with our schema
export const createAppStore = () => {
  // Create store with schema-based typing
  const store = createStore().setSchema(tablesSchema, valuesSchema);

  // Initialize with default values
  store.setValues({
    reminderLeadTime: 7,
    syncStatus: 'idle',
    onlineStatus: navigator.onLine, // Initial online status
    lastSyncTimestamp: 0,
  });

  return store;
};

// Create persister for local storage
export const createAppPersister = async (store: ReturnType<typeof createAppStore>) => {
  // Create a local persister with the storage key
  // Cast through unknown for proper typing
  const persister = createLocalPersister(store as unknown as Store, 'subscription-manager');

  // Initialize local storage persistence
  try {
    // Try to load data from localStorage
    await persister.load();
    console.log('Data loaded from local storage');
  } catch (error) {
    console.error('Failed to load data from local storage:', error);
    // If no data exists, this is probably first run
  }

  // Debounce save operations to avoid too many writes
  let saveTimeout: number | null = null;
  const debouncedSave = () => {
    if (saveTimeout !== null) {
      clearTimeout(saveTimeout);
    }
    saveTimeout = window.setTimeout(() => {
      persister.save().catch(error => {
        console.error('Failed to save data to local storage:', error);
      });
      saveTimeout = null;
    }, 100); // 100ms debounce
  };

  // Set up auto-save for tables
  store.addTablesListener(debouncedSave);

  // Also save when values change
  store.addValuesListener(debouncedSave);

  return persister;
};

// Online status detection
export const setupOnlineStatusTracking = (store: ReturnType<typeof createAppStore>) => {
  // Track online status
  const updateOnlineStatus = () => {
    store.setValue('onlineStatus', navigator.onLine);

    // If we just went online, update the timestamp to trigger a sync
    if (navigator.onLine) {
      store.setValue('lastSyncTimestamp', Date.now());
    }
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  // Initial status
  updateOnlineStatus();

  return () => {
    window.removeEventListener('online', updateOnlineStatus);
    window.removeEventListener('offline', updateOnlineStatus);
  };
};
