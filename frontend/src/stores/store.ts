import { createStore } from 'tinybase/with-schemas';
import { createLocalPersister } from 'tinybase/persisters/persister-browser';
import { tablesSchema, valuesSchema } from './schema';

// Create a typed store with our schema
export const createAppStore = () => {
  // Create store with schema-based typing
  const store = createStore().setSchema(tablesSchema, valuesSchema);

  // Initialize with default values
  store.setValues({
    reminderLeadTime: 7,
    syncStatus: 'idle',
    onlineStatus: navigator.onLine, // Initial online status
  });

  return store;
};

// Create persister for local storage
export const createAppPersister = async (store: ReturnType<typeof createAppStore>) => {
  // Cast to the expected type for createLocalPersister
  const persister = createLocalPersister(store as any, 'subscription-manager');
  
  // Initialize local storage persistence
  try {
    // Try to load data from localStorage
    await persister.load();
    console.log('Data loaded from local storage');
  } catch (error) {
    console.error('Failed to load data from local storage:', error);
    // If no data exists, this is probably first run
  }

  // Set up auto-save - we don't need to clean up the listeners as they'll be garbage collected with the store
  store.addTablesListener(() => {
    persister.save().catch((error) => {
      console.error('Failed to save data to local storage:', error);
    });
  });

  // Also save when values change
  store.addValuesListener(() => {
    persister.save().catch((error) => {
      console.error('Failed to save data to local storage:', error);
    });
  });

  return persister;
};

// Online status detection
export const setupOnlineStatusTracking = (store: ReturnType<typeof createAppStore>) => {
  // Track online status
  const updateOnlineStatus = () => {
    store.setValue('onlineStatus', navigator.onLine);
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  return () => {
    window.removeEventListener('online', updateOnlineStatus);
    window.removeEventListener('offline', updateOnlineStatus);
  };
};