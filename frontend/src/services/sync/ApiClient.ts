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
  private token: string | null = null;
  
  constructor(apiBaseUrl?: string) {
    // Use environment variable from .env file, fallback to default if not set
    this.apiBaseUrl = apiBaseUrl || import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    // Try to get token from localStorage (if we're in a browser environment)
    if (typeof window !== 'undefined' && window.localStorage) {
      this.token = localStorage.getItem('subscription_manager_token');
    }
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
      headers: this.getHeaders(false)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch subscriptions: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  /**
   * Fetch a single subscription from the server
   */
  async fetchSubscription(id: string): Promise<Subscription> {
    if (!this.token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${this.apiBaseUrl}/subscriptions/${id}`, {
      headers: this.getHeaders(false)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch subscription: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  /**
   * Create a new subscription on the server
   */
  async createSubscription(subscription: SubscriptionData): Promise<Subscription> {
    if (!this.token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${this.apiBaseUrl}/subscriptions`, {
      method: 'POST',
      headers: this.getHeaders(),
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
    if (!this.token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${this.apiBaseUrl}/subscriptions/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
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
    if (!this.token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${this.apiBaseUrl}/subscriptions/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(false)
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
  
  /**
   * Login to the backend and get an authentication token
   */
  async login(email: string, password: string): Promise<{ token: string; user: { id: string; email: string } }> {
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