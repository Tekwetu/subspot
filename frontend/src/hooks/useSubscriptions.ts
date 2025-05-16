import { useCallback } from 'react';
import { useStore } from '../stores/StoreContext';

// Subscription interface based on our schema
export interface Subscription {
  id: string;
  name: string;
  plan?: string;
  price: number;
  currency: string; 
  billingCycle: string;
  startDate: string;
  renewalDate: string;
  paymentMethod?: string;
  accountEmail?: string;
  category?: string;
  status: string;
  cancellationInfo?: string;
  notes?: string;
  lastModified: number;
}

export const useSubscriptions = () => {
  const store = useStore();
  
  // Get all subscription IDs
  const subscriptionIds = store.getRowIds('subscriptions');

  // Get a single subscription by ID
  const getSubscription = useCallback(
    (id: string): Subscription | null => {
      const subscription = store.getRow('subscriptions', id);
      if (!subscription) return null;
      return {
        id,
        ...subscription as Omit<Subscription, 'id'>,
      };
    },
    [store]
  );

  // Add a new subscription
  const addSubscription = useCallback(
    (subscription: Omit<Subscription, 'id' | 'lastModified'>) => {
      const id = crypto.randomUUID();
      store.setRow('subscriptions', id, {
        ...subscription,
        lastModified: Date.now(),
      });
      return id;
    },
    [store]
  );

  // Update an existing subscription
  const updateSubscription = useCallback(
    (id: string, updates: Partial<Omit<Subscription, 'id' | 'lastModified'>>) => {
      // Get current subscription data
      const current = store.getRow('subscriptions', id);
      if (!current) return false;
      
      // Update with new data
      store.transaction(() => {
        for (const [key, value] of Object.entries(updates)) {
          if (value !== undefined) {
            store.setCell('subscriptions', id, key as keyof Omit<Subscription, 'id'>, value);
          }
        }
        // Update lastModified timestamp
        store.setCell('subscriptions', id, 'lastModified', Date.now());
      });
      
      return true;
    },
    [store]
  );

  // Delete a subscription
  const deleteSubscription = useCallback(
    (id: string) => {
      store.delRow('subscriptions', id);
      return true;
    },
    [store]
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
        const sub = getSubscription(id);
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
  };
};