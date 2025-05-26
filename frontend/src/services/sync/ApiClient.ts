import type { Subscription, SubscriptionData, SubscriptionUpdates } from '../../types/subscription';
import type { SyncOperation } from './types';
import { SyncOperationType } from './types';

// Type for backend subscription data (with snake_case)
interface BackendSubscription {
  id: string;
  name: string;
  plan?: string;
  price: number;
  currency: string;
  billing_cycle: string;
  start_date: string;
  renewal_date: string;
  payment_method?: string;
  account?: string;
  category?: string;
  status: string;
  cancellation_info?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  synced_at: string;
}

/**
 * Handle all API communication with the backend
 */
export class ApiClient {
  private apiBaseUrl: string;
  private token: string | null = null;

  constructor(apiBaseUrl?: string) {
    // Use environment variable from .env file, fallback to default if not set
    let baseUrl = apiBaseUrl || import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // Remove trailing slash if present for consistency
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }

    this.apiBaseUrl = baseUrl;

    // Try to get token from localStorage (if we're in a browser environment)
    if (typeof window !== 'undefined' && window.localStorage) {
      this.token = localStorage.getItem('subscription_manager_token');
    }
  }

  /**
   * Transform a backend subscription (snake_case) to frontend subscription (camelCase)
   */
  private transformSubscription(backendSub: BackendSubscription): Subscription {
    return {
      id: backendSub.id,
      name: backendSub.name,
      plan: backendSub.plan,
      price: backendSub.price,
      currency: backendSub.currency,
      billingCycle: backendSub.billing_cycle,
      startDate: backendSub.start_date,
      renewalDate: backendSub.renewal_date,
      paymentMethod: backendSub.payment_method,
      accountEmail: backendSub.account,
      category: backendSub.category,
      status: backendSub.status,
      cancellationInfo: backendSub.cancellation_info,
      notes: backendSub.notes,
      lastModified: new Date(backendSub.updated_at).getTime(),
      updatedAt: backendSub.updated_at,
    };
  }

  /**
   * Transform frontend subscription (camelCase) to backend format (snake_case)
   */
  private transformToBackendFormat(
    subscription: Partial<SubscriptionData>
  ): Record<string, unknown> {
    const backendFormat: Record<string, unknown> = {};

    // Map camelCase to snake_case
    if (subscription.name !== undefined) backendFormat.name = subscription.name;
    if (subscription.plan !== undefined) backendFormat.plan = subscription.plan;
    if (subscription.price !== undefined) backendFormat.price = subscription.price;
    if (subscription.currency !== undefined) backendFormat.currency = subscription.currency;
    if (subscription.billingCycle !== undefined)
      backendFormat.billing_cycle = subscription.billingCycle;
    if (subscription.startDate !== undefined) backendFormat.start_date = subscription.startDate;
    if (subscription.renewalDate !== undefined)
      backendFormat.renewal_date = subscription.renewalDate;
    if (subscription.paymentMethod !== undefined)
      backendFormat.payment_method = subscription.paymentMethod;
    if (subscription.accountEmail !== undefined) backendFormat.account = subscription.accountEmail;
    if (subscription.category !== undefined) backendFormat.category = subscription.category;
    if (subscription.status !== undefined) backendFormat.status = subscription.status;
    if (subscription.cancellationInfo !== undefined)
      backendFormat.cancellation_info = subscription.cancellationInfo;
    if (subscription.notes !== undefined) backendFormat.notes = subscription.notes;

    return backendFormat;
  }

  /**
   * Update the authentication token
   */
  setToken(token: string | null): void {
    this.token = token;
  }

  /**
   * Get headers for authenticated requests
   */
  private getHeaders(contentType = true): HeadersInit {
    const headers: HeadersInit = {};

    if (contentType) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Fetch all subscriptions from the server
   */
  async fetchSubscriptions(): Promise<Subscription[]> {
    if (!this.token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${this.apiBaseUrl}/subscriptions`, {
      headers: this.getHeaders(false),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch subscriptions: ${response.statusText}`);
    }

    const backendSubscriptions: BackendSubscription[] = await response.json();
    return backendSubscriptions.map(sub => this.transformSubscription(sub));
  }

  /**
   * Fetch a single subscription from the server
   */
  async fetchSubscription(id: string): Promise<Subscription> {
    if (!this.token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${this.apiBaseUrl}/subscriptions/${id}`, {
      headers: this.getHeaders(false),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch subscription: ${response.statusText}`);
    }

    const backendSubscription: BackendSubscription = await response.json();
    return this.transformSubscription(backendSubscription);
  }

  /**
   * Create a new subscription on the server
   */
  async createSubscription(subscription: SubscriptionData): Promise<Subscription> {
    if (!this.token) {
      throw new Error('Authentication required');
    }

    const backendData = this.transformToBackendFormat(subscription);

    const response = await fetch(`${this.apiBaseUrl}/subscriptions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(backendData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create subscription: ${response.statusText}`);
    }

    const backendSubscription: BackendSubscription = await response.json();
    return this.transformSubscription(backendSubscription);
  }

  /**
   * Update an existing subscription on the server
   */
  async updateSubscription(id: string, subscription: SubscriptionUpdates): Promise<Subscription> {
    if (!this.token) {
      throw new Error('Authentication required');
    }

    const backendData = this.transformToBackendFormat({
      ...subscription,
      updatedAt: new Date().toISOString(),
    });

    const response = await fetch(`${this.apiBaseUrl}/subscriptions/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(backendData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update subscription: ${response.statusText}`);
    }

    const backendSubscription: BackendSubscription = await response.json();
    return this.transformSubscription(backendSubscription);
  }

  /**
   * Delete a subscription from the server
   */
  async deleteSubscription(id: string): Promise<void> {
    if (!this.token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${this.apiBaseUrl}/subscriptions/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(false),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete subscription: ${response.statusText}`);
    }
  }

  /**
   * Process a sync operation based on its type
   */
  async processSyncOperation(operation: SyncOperation): Promise<unknown> {
    switch (operation.type) {
      case SyncOperationType.CREATE:
        return this.createSubscription(operation.data as SubscriptionData);

      case SyncOperationType.UPDATE:
        return this.updateSubscription(operation.entityId, operation.data as SubscriptionUpdates);

      case SyncOperationType.DELETE:
        return this.deleteSubscription(operation.entityId);

      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  /**
   * Check server health to confirm connectivity
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/health`, {
        method: 'HEAD',
        cache: 'no-store',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Login to the backend and get an authentication token
   */
  async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: { id: string; email: string } }> {
    const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Store the token for future requests
    this.setToken(data.access_token);

    return {
      token: data.access_token,
      user: data.user,
    };
  }
}
