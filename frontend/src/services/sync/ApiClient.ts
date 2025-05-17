import type { 
  Subscription, 
  SubscriptionData, 
  SubscriptionUpdates 
} from '../../types/subscription';
import type { SyncOperation } from './types';
import { SyncOperationType } from './types';

/**
 * Handle all API communication with the backend
 */
export class ApiClient {
  private apiBaseUrl: string;
  
  constructor(apiBaseUrl: string = '/api') {
    this.apiBaseUrl = apiBaseUrl;
  }
  
  /**
   * Fetch all subscriptions from the server
   */
  async fetchSubscriptions(): Promise<Subscription[]> {
    const response = await fetch(`${this.apiBaseUrl}/subscriptions`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch subscriptions: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  /**
   * Fetch a single subscription from the server
   */
  async fetchSubscription(id: string): Promise<Subscription> {
    const response = await fetch(`${this.apiBaseUrl}/subscriptions/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch subscription: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  /**
   * Create a new subscription on the server
   */
  async createSubscription(subscription: SubscriptionData): Promise<Subscription> {
    const response = await fetch(`${this.apiBaseUrl}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create subscription: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  /**
   * Update an existing subscription on the server
   */
  async updateSubscription(id: string, subscription: SubscriptionUpdates): Promise<Subscription> {
    const response = await fetch(`${this.apiBaseUrl}/subscriptions/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...subscription, updatedAt: new Date().toISOString() }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update subscription: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  /**
   * Delete a subscription from the server
   */
  async deleteSubscription(id: string): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/subscriptions/${id}`, {
      method: 'DELETE',
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
        return this.updateSubscription(
          operation.entityId,
          operation.data as SubscriptionUpdates
        );
        
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
}