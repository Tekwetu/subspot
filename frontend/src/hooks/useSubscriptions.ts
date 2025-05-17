import { useCallback, useMemo } from 'react';
import { useStore } from '../stores/useStore';
import { useSyncContext } from '../services/sync/useSyncContext';
import { SyncOperationType } from '../services/sync/types';
import { useOnlineStatusContext } from '../hooks/useOnlineStatus/useOnlineStatusContext';
import { useAuth } from '../services/auth/useAuth';
import * as UiReact from 'tinybase/ui-react';
import type { WithSchemas } from 'tinybase/ui-react/with-schemas';
import type { AppSchema } from '../stores/schema';
import type {
  Subscription,
  SubscriptionData,
  NewSubscriptionData,
  SubscriptionUpdates,
} from '../types/subscription';

export const useSubscriptions = () => {
  const store = useStore();
  const { syncManager, syncStatus } = useSyncContext();
  const { isOnline } = useOnlineStatusContext();
  // Auth state used by sync manager
  useAuth();

  // Check if we have an actual sync manager (not the placeholder)
  const hasSyncManager = syncManager !== null && typeof syncManager === 'object';

  // Use the schema-based typed hooks
  const UiReactWithSchemas = UiReact as unknown as WithSchemas<AppSchema>;
  const { useRowIds } = UiReactWithSchemas;

  // Get all subscription IDs using the typed hook
  // This automatically re-renders components when the subscription data changes
  const rawSubscriptionIds = useRowIds('subscriptions', store);
  const subscriptionIds = useMemo(() => rawSubscriptionIds || [], [rawSubscriptionIds]);

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

      // Prepare the full subscription object with required fields
      const fullSubscription = {
        ...subscription,
        lastModified: timestamp,
        updatedAt: isoTimestamp,
      };

      // Add to local store first
      try {
        // Check if store.setRow exists and is a function
        if (store.setRow && typeof store.setRow === 'function') {
          // This will trigger reactive UI updates through TinyBase
          store.setRow('subscriptions', id, fullSubscription);

          // Log success for debugging
          console.log(`Added subscription to local store: ${id}`, fullSubscription);
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
            updatedAt: isoTimestamp,
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

          console.log(`Updated subscription in local store: ${id}`, updates);
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
          // This will trigger reactive UI updates through TinyBase
          store.delRow('subscriptions', id);
          console.log(`Deleted subscription from local store: ${id}`);
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
        .filter((sub): sub is Subscription => {
          // Skip null subscriptions
          if (sub === null) return false;

          // Skip inactive subscriptions
          if (sub.status !== 'active') return false;

          // Skip if renewal date doesn't exist
          if (!sub.renewalDate) return false;

          // Include if renewal date is in the future window
          return new Date(sub.renewalDate) <= futureDate;
        })
        .sort((a: Subscription, b: Subscription) => {
          // Both subscriptions should have renewalDate at this point, but add a safeguard
          const dateA = a.renewalDate ? new Date(a.renewalDate).getTime() : 0;
          const dateB = b.renewalDate ? new Date(b.renewalDate).getTime() : 0;
          return dateA - dateB;
        });
    },
    [subscriptionIds, getSubscription]
  );

  // Calculate total costs (monthly equivalent)
  const calculateMonthlyCost = useCallback((): number => {
    return subscriptionIds.reduce((total: number, id: string) => {
      const sub: Subscription | null = getSubscription(id);
      if (!sub || sub.status !== 'active') return total;

      let monthlyPrice = sub.price;
      // Convert non-monthly prices to monthly equivalent
      // Default to monthly if billingCycle is undefined
      const cycle = sub.billingCycle?.toLowerCase() || 'monthly';
      switch (cycle) {
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
  }, [subscriptionIds, getSubscription]);

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
