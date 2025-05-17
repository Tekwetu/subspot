/**
 * Subscription data interface
 * Defines the structure of subscription data throughout the application
 */
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
  updatedAt?: string;
}

/**
 * Subscription data without the ID field
 * Used when creating or updating subscriptions
 */
export type SubscriptionData = Omit<Subscription, 'id'>;

/**
 * New subscription data without metadata fields
 * Used when adding a new subscription
 */
export type NewSubscriptionData = Omit<Subscription, 'id' | 'lastModified' | 'updatedAt'>;

/**
 * Subscription updates
 * Used for partial updates to a subscription
 */
export type SubscriptionUpdates = Partial<NewSubscriptionData>;