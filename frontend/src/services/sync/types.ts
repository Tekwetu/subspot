/**
 * Types for the sync service
 */

// Represents a sync operation for a record
export enum SyncOperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

// Structure for a pending sync operation
export interface SyncOperation {
  id: string;
  type: SyncOperationType;
  entityId: string;
  entityType: string;
  data?: Record<string, unknown>;
  timestamp: number;
  attempts: number;
  error?: string;
}

// Conflict resolution strategies
export enum ConflictResolutionStrategy {
  LAST_WRITE_WINS = 'LAST_WRITE_WINS',
  SERVER_WINS = 'SERVER_WINS',
  CLIENT_WINS = 'CLIENT_WINS',
  MANUAL = 'MANUAL',
}

// Configuration for the sync service
export interface SyncConfig {
  syncInterval: number;
  maxRetryAttempts: number;
  conflictResolution: ConflictResolutionStrategy;
  autoSync: boolean;
}

// Sync status tracking
export enum SyncStatus {
  IDLE = 'IDLE',
  SYNCING = 'SYNCING',
  OFFLINE = 'OFFLINE',
  ERROR = 'ERROR',
}

// The result of a sync operation
export interface SyncResult {
  success: boolean;
  error?: string;
  conflicts?: Array<{
    entityId: string;
    entityType: string;
    clientData: Record<string, unknown>;
    serverData: Record<string, unknown>;
    resolution?: string;
  }>;
}