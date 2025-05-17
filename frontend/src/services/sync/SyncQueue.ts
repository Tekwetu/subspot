import type { SyncOperation } from './types';

/**
 * Manages the queue of pending sync operations
 * Stores operations when offline to be processed when connection is restored
 */
export class SyncQueue {
  private static readonly STORAGE_KEY = 'subscription_sync_queue';
  private queue: SyncOperation[] = [];

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Add a new operation to the sync queue
   */
  add(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'attempts'>): void {
    const newOperation: SyncOperation = {
      ...operation,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      attempts: 0,
    };

    this.queue.push(newOperation);
    this.saveToStorage();
  }

  /**
   * Get all pending operations
   */
  getAll(): SyncOperation[] {
    return [...this.queue];
  }

  /**
   * Remove an operation from the queue
   */
  remove(operationId: string): void {
    this.queue = this.queue.filter(op => op.id !== operationId);
    this.saveToStorage();
  }

  /**
   * Update an operation's attempt count and error status
   */
  updateAttempt(operationId: string, error?: string): void {
    this.queue = this.queue.map(op => {
      if (op.id === operationId) {
        return {
          ...op,
          attempts: op.attempts + 1,
          error,
        };
      }
      return op;
    });
    this.saveToStorage();
  }

  /**
   * Clear all operations from the queue
   */
  clear(): void {
    this.queue = [];
    this.saveToStorage();
  }

  /**
   * Get the number of operations in the queue
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Save the queue to local storage
   */
  private saveToStorage(): void {
    localStorage.setItem(SyncQueue.STORAGE_KEY, JSON.stringify(this.queue));
  }

  /**
   * Load the queue from local storage
   */
  private loadFromStorage(): void {
    const storedQueue = localStorage.getItem(SyncQueue.STORAGE_KEY);
    if (storedQueue) {
      try {
        this.queue = JSON.parse(storedQueue);
      } catch (e) {
        console.error('Failed to parse sync queue from storage', e);
        this.queue = [];
      }
    }
  }
}
