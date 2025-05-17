import { useCallback, useMemo } from 'react';
import { useStore } from '../stores/useStore';
import { useSyncContext } from '../services/sync/useSyncContext';
import { SyncOperationType } from '../services/sync/types';
import { useOnlineStatusContext } from '../hooks/useOnlineStatus/useOnlineStatusContext';
import { useAuth } from '../services/auth/useAuth';
import type { 
  Subscription, 
  SubscriptionData, 
  NewSubscriptionData, 
  SubscriptionUpdates 
} from '../types/subscription';

export const useSubscriptions = () => {
  const store = useStore();
  const { syncManager, syncStatus } = useSyncContext();
  const { isOnline } = useOnlineStatusContext();
  // Auth state used by sync manager
  useAuth();
  
  // Check if we have an actual sync manager (not the placeholder)
  const hasSyncManager = syncManager !== null && typeof syncManager === 'object';
  
  // Get all subscription IDs
  const subscriptionIds = useMemo(() => {
    try {
      // Call getRowIds directly on the store with the table ID
      if (store.getRowIds && typeof store.getRowIds === 'function') {
        return store.getRowIds('subscriptions') || [];
      }
      
      // Fallback: return empty array and log warning
      console.warn('Could not get subscription IDs - getRowIds is not a function on store');
      return [];
    } catch (error) {
      console.error('Error getting subscription IDs:', error);
      return [];
    }
  }, [store]);

  // Get a single subscription by ID
  const getSubscription = useCallback(
    (id: string): Subscription | null => {
      try {
        // Check if store.getRow exists and is a function
        if (store.getRow && typeof store.getRow === 'function') {
          const row = store.getRow('subscriptions', id);
          if (!row) return null;
          
          // Convert the row data to our subscription type
          return {
            id,
            ...(row as Omit<Subscription, 'id'>),
          };
        }
        
        console.warn('Could not get row - getRow is not a function on store');
        return null;
      } catch (error) {
        console.error('Error getting subscription:', error);
        return null;
      }
    },
    [store]
  );

  // Add a new subscription
  const addSubscription = useCallback(
    (subscription: NewSubscriptionData) => {
      const id = crypto.randomUUID();
      const now = new Date();
      const timestamp = now.getTime();
      const isoTimestamp = now.toISOString();
      
      // Add to local store first
      try {
        // Check if store.setRow exists and is a function
        if (store.setRow && typeof store.setRow === 'function') {
          store.setRow('subscriptions', id, {
            ...subscription,
            lastModified: timestamp,
            updatedAt: isoTimestamp,
          });
        } else {
          console.warn('Could not set row - setRow is not a function on store');
        }
      } catch (error) {
        console.error('Error setting row:', error);
        // Continue execution to try syncing
      }
      
      // Queue for sync to server if online
      if (hasSyncManager && syncManager && isOnline) {
        syncManager.queueOperation({
          type: SyncOperationType.CREATE,
          entityId: id,
          entityType: 'subscription',
          data: { 
            ...subscription, 
            lastModified: timestamp, 
            updatedAt: isoTimestamp 
          },
        });
      }
      
      return id;
    },
    [store, syncManager, isOnline, hasSyncManager]
  );

  // Update an existing subscription
  const updateSubscription = useCallback(
    (id: string, updates: SubscriptionUpdates) => {
      try {
        // Check if store.getRow exists and is a function
        if (!store.getRow || typeof store.getRow !== 'function') {
          console.warn('Could not get row - getRow is not a function on store');
          return false;
        }
        
        const row = store.getRow('subscriptions', id);
        if (!row) return false;
        
        const now = new Date();
        const timestamp = now.getTime();
        const isoTimestamp = now.toISOString();
        
        // Update local store using transaction
        store.transaction(() => {
          // Check if store.setCell exists and is a function
          if (!store.setCell || typeof store.setCell !== 'function') {
            console.warn('Could not update cells - setCell is not a function on store');
            return;
          }
          
          // Update all the provided fields
          for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) {
              // Use type assertion to handle the string keys
              store.setCell('subscriptions', id, key as keyof SubscriptionData, value);
            }
          }
          
          // Update timestamps
          store.setCell('subscriptions', id, 'lastModified', timestamp);
          store.setCell('subscriptions', id, 'updatedAt', isoTimestamp);
        });
        
        // Queue for sync to server if online
        if (hasSyncManager && syncManager && isOnline) {
          try {
            // Get updated row for sync
            if (!store.getRow || typeof store.getRow !== 'function') {
              console.warn('Could not get updated row - getRow is not a function on store');
              return false;
            }
            
            const updatedRow = store.getRow('subscriptions', id);
            if (!updatedRow) return false;
            
            syncManager.queueOperation({
              type: SyncOperationType.UPDATE,
              entityId: id,
              entityType: 'subscription',
              data: updatedRow,
            });
          } catch (error) {
            console.error('Error syncing update:', error);
            return false;
          }
        }
      } catch (error) {
        console.error('Error in update subscription:', error);
        return false;
      }
      
      return true;
    },
    [store, syncManager, isOnline, hasSyncManager]
  );

  // Delete a subscription
  const deleteSubscription = useCallback(
    (id: string) => {
      // Delete from local store first
      try {
        // Access the delRow method safely
        if (store.delRow && typeof store.delRow === 'function') {
          store.delRow('subscriptions', id);
        } else {
          console.warn('Could not delete row - delRow is not a function on store');
          // Continue execution to try syncing
        }
      } catch (error) {
        console.error('Error deleting row:', error);
        // Continue execution to try syncing
      }
      
      // Queue for sync to server if online
      if (hasSyncManager && syncManager && isOnline) {
        syncManager.queueOperation({
          type: SyncOperationType.DELETE,
          entityId: id,
          entityType: 'subscription',
        });
      }
      
      return true;
    },
    [store, syncManager, isOnline, hasSyncManager]
  );

  // Get upcoming renewals
  const getUpcomingRenewals = useCallback(
    (daysAhead: number = 30): Subscription[] => {
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + daysAhead);
      
      return subscriptionIds
        .map((id: string) => getSubscription(id))
        .filter((sub): sub is Subscription => 
          sub !== null && 
          sub.status === 'active' &&
          new Date(sub.renewalDate) <= futureDate
        )
        .sort((a: Subscription, b: Subscription) => 
          new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime()
        );
    },
    [subscriptionIds, getSubscription]
  );

  // Calculate total costs (monthly equivalent)
  const calculateMonthlyCost = useCallback(
    (): number => {
      return subscriptionIds.reduce((total: number, id: string) => {
        const sub: Subscription | null = getSubscription(id);
        if (!sub || sub.status !== 'active') return total;
        
        let monthlyPrice = sub.price;
        // Convert non-monthly prices to monthly equivalent
        switch (sub.billingCycle.toLowerCase()) {
          case 'yearly':
          case 'annual':
            monthlyPrice = sub.price / 12;
            break;
          case 'quarterly':
            monthlyPrice = sub.price / 3;
            break;
          case 'weekly':
            monthlyPrice = sub.price * 4.33; // Average weeks per month
            break;
          case 'daily':
            monthlyPrice = sub.price * 30.44; // Average days per month
            break;
        }
        
        return total + monthlyPrice;
      }, 0);
    },
    [subscriptionIds, getSubscription]
  );

  return {
    subscriptions: store.getTable('subscriptions'),
    subscriptionIds,
    getSubscription,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    getUpcomingRenewals,
    calculateMonthlyCost,
    isOnline,
    syncStatus,
    hasSyncManager,
  };
};