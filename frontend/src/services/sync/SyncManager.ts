import type { Store } from 'tinybase/with-schemas';
import type { AppSchema } from '../../stores/schema';
import { SyncQueue } from './SyncQueue';
import { ApiClient } from './ApiClient';
import { SyncOperationType, ConflictResolutionStrategy, SyncStatus } from './types';
import type { SyncConfig, SyncResult, SyncOperation } from './types';
import type { Subscription, SubscriptionData } from '../../types/subscription';

/**
 * Manages synchronization between local TinyBase store and backend
 */
export class SyncManager {
  private store: Store<AppSchema>;
  private syncQueue: SyncQueue;
  private apiClient: ApiClient;
  private config: SyncConfig;
  private syncStatus: SyncStatus = SyncStatus.IDLE;
  private syncTimer: number | null = null;
  private statusListeners: ((status: SyncStatus) => void)[] = [];

  /**
   * Get the API client instance
   */
  getApiClient(): ApiClient {
    return this.apiClient;
  }

  constructor(
    store: Store<AppSchema>,
    syncQueue: SyncQueue = new SyncQueue(),
    apiClient: ApiClient = new ApiClient(),
    config: Partial<SyncConfig> = {}
  ) {
    this.store = store;
    this.syncQueue = syncQueue;
    this.apiClient = apiClient;

    // Default configuration with overrides
    this.config = {
      syncInterval: 60000, // 1 minute
      maxRetryAttempts: 3,
      conflictResolution: ConflictResolutionStrategy.LAST_WRITE_WINS,
      autoSync: true,
      ...config,
    };

    // Start auto sync if enabled
    if (this.config.autoSync) {
      this.startAutoSync();
    }
  }

  /**
   * Queue an operation to be synced with the backend
   */
  queueOperation(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'attempts'>): void {
    this.syncQueue.add(operation);
  }

  /**
   * Start the automatic sync process
   */
  startAutoSync(): void {
    if (this.syncTimer !== null) {
      return;
    }

    this.syncTimer = window.setInterval(() => {
      this.sync().catch(err => {
        console.error('Auto sync failed:', err);
      });
    }, this.config.syncInterval);
  }

  /**
   * Stop the automatic sync process
   */
  stopAutoSync(): void {
    if (this.syncTimer !== null) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /**
   * Get the current sync status
   */
  getStatus(): SyncStatus {
    return this.syncStatus;
  }

  /**
   * Register a listener for sync status changes
   */
  onStatusChange(listener: (status: SyncStatus) => void): () => void {
    this.statusListeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }

  /**
   * Update sync status and notify listeners
   */
  private setStatus(status: SyncStatus): void {
    this.syncStatus = status;
    this.statusListeners.forEach(listener => listener(status));
  }

  /**
   * Synchronize data between local store and backend
   */
  async sync(): Promise<SyncResult> {
    // Don't sync if already syncing
    if (this.syncStatus === SyncStatus.SYNCING) {
      return { success: false, error: 'Sync already in progress' };
    }

    // Check connectivity first
    const isConnected = await this.apiClient.checkHealth();
    if (!isConnected) {
      this.setStatus(SyncStatus.OFFLINE);
      return { success: false, error: 'Offline' };
    }

    try {
      this.setStatus(SyncStatus.SYNCING);

      // Step 1: Process pending operations from queue
      await this.processQueue();

      // Step 2: Pull latest data from server
      await this.pullFromServer();

      this.setStatus(SyncStatus.IDLE);
      return { success: true };
    } catch (error) {
      this.setStatus(SyncStatus.ERROR);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Process all pending operations in the sync queue
   */
  private async processQueue(): Promise<void> {
    const operations = this.syncQueue.getAll();

    for (const operation of operations) {
      try {
        await this.apiClient.processSyncOperation(operation);
        this.syncQueue.remove(operation.id);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.syncQueue.updateAttempt(operation.id, errorMessage);

        // If max retries exceeded, remove from queue
        if (operation.attempts >= this.config.maxRetryAttempts) {
          this.syncQueue.remove(operation.id);
          console.error(
            `Operation ${operation.id} failed after ${operation.attempts} attempts:`,
            errorMessage
          );
        }
      }
    }
  }

  /**
   * Pull latest data from server and update local store
   */
  private async pullFromServer(): Promise<void> {
    // Fetch all subscriptions from server
    const serverSubscriptions = await this.apiClient.fetchSubscriptions();
    const localSubscriptions = this.getAllLocalSubscriptions();

    // Create a map for easier lookup
    const localById = new Map(localSubscriptions.map(sub => [sub.id, sub]));

    // Process each server subscription
    for (const serverSub of serverSubscriptions) {
      const localSub = localById.get(serverSub.id);

      if (!localSub) {
        // New subscription from server, add to local store
        this.addSubscriptionToStore(serverSub);
      } else {
        // Existing subscription, check for conflicts
        this.resolveConflict(localSub, serverSub);
      }

      // Remove from map to track processed items
      localById.delete(serverSub.id);
    }

    // Any remaining items in localById were deleted on server
    for (const [id] of localById) {
      // Check if it wasn't just created locally (waiting for sync)
      const pendingCreate = this.syncQueue
        .getAll()
        .some(op => op.entityId === id && op.entityType === 'subscription');

      if (!pendingCreate) {
        this.removeSubscriptionFromStore(id);
      }
    }
  }

  /**
   * Get all subscriptions from local store
   */
  private getAllLocalSubscriptions(): Subscription[] {
    const subscriptions: Subscription[] = [];
    const table = this.store.getTable('subscriptions');
    if (!table) return [];

    // Get all row IDs using the store method
    let ids: string[] = [];
    try {
      // Use the correct method directly on the store
      if (this.store.getRowIds && typeof this.store.getRowIds === 'function') {
        ids = this.store.getRowIds('subscriptions');
      } else {
        console.warn('Could not get subscription IDs - getRowIds is not a function on store');
        return [];
      }
    } catch (error) {
      console.error('Error getting subscription IDs:', error);
      return [];
    }

    for (const id of ids) {
      try {
        // Access getRow method safely from the store
        if (!this.store.getRow || typeof this.store.getRow !== 'function') {
          console.warn('Could not get row - getRow is not a function on store');
          continue;
        }

        const row = this.store.getRow('subscriptions', id);
        if (row) {
          // Convert row to Subscription type
          subscriptions.push({
            id,
            ...(row as unknown as Omit<Subscription, 'id'>),
          });
        }
      } catch (error) {
        console.error(`Error getting row ${id}:`, error);
        continue;
      }
    }

    return subscriptions;
  }

  /**
   * Add a subscription to the local store
   */
  private addSubscriptionToStore(subscription: Subscription): void {
    const table = this.store.getTable('subscriptions');
    if (!table) return;

    const { id, ...data } = subscription;

    try {
      // Access setRow method safely on the store
      if (!this.store.setRow || typeof this.store.setRow !== 'function') {
        console.warn('Could not set row - setRow is not a function on store');
        return;
      }

      this.store.setRow('subscriptions', id, data as unknown as SubscriptionData);
    } catch (error) {
      console.error('Error setting subscription:', error);
    }
  }

  /**
   * Remove a subscription from the local store
   */
  private removeSubscriptionFromStore(id: string): void {
    const table = this.store.getTable('subscriptions');
    if (!table) return;

    if (id) {
      try {
        // Access delRow method safely on the store
        if (!this.store.delRow || typeof this.store.delRow !== 'function') {
          console.warn('Could not delete row - delRow is not a function on store');
          return;
        }

        this.store.delRow('subscriptions', id);
      } catch (error) {
        console.error('Error deleting subscription:', error);
      }
    }
  }

  /**
   * Resolve conflict between local and server versions of a subscription
   */
  private resolveConflict(localSub: Subscription, serverSub: Subscription): void {
    // Get timestamps for comparison
    const localUpdated = new Date(localSub.updatedAt || 0).getTime();
    const serverUpdated = new Date(serverSub.updatedAt || 0).getTime();

    switch (this.config.conflictResolution) {
      case ConflictResolutionStrategy.SERVER_WINS:
        this.addSubscriptionToStore(serverSub);
        break;

      case ConflictResolutionStrategy.CLIENT_WINS:
        // Don't update if local is newer
        if (localUpdated > serverUpdated) {
          // Queue an update to push local changes to server
          this.queueOperation({
            type: SyncOperationType.UPDATE,
            entityId: localSub.id,
            entityType: 'subscription',
            data: this.removeIdFromSubscription(localSub),
          });
        } else {
          this.addSubscriptionToStore(serverSub);
        }
        break;

      case ConflictResolutionStrategy.LAST_WRITE_WINS:
      default:
        // Use whichever version was updated most recently
        if (localUpdated > serverUpdated) {
          this.queueOperation({
            type: SyncOperationType.UPDATE,
            entityId: localSub.id,
            entityType: 'subscription',
            data: this.removeIdFromSubscription(localSub),
          });
        } else {
          this.addSubscriptionToStore(serverSub);
        }
        break;
    }
  }

  /**
   * Helper to remove id from subscription for API calls
   */
  private removeIdFromSubscription(subscription: Subscription): Omit<Subscription, 'id'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...rest } = subscription;
    return rest;
  }
}
