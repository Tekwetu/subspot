import type { SubscriptionData, SubscriptionUpdates } from '../../types/subscription';

// Sync operation types
export enum SyncOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

// Sync operation interface
export interface SyncOperation {
  id: string;
  type: SyncOperationType;
  entityId: string;
  entityType: 'subscription';
  data?: SubscriptionData | SubscriptionUpdates;
  timestamp: number;
  attempts: number;
  lastError?: string;
}

// Sync manager status
export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  ERROR = 'error',
  OFFLINE = 'offline',
}

// Conflict resolution strategy
export enum ConflictResolutionStrategy {
  SERVER_WINS = 'server_wins',
  CLIENT_WINS = 'client_wins',
  LAST_WRITE_WINS = 'last_write_wins',
}

// Sync manager configuration
export interface SyncConfig {
  syncInterval: number; // in milliseconds
  maxRetryAttempts: number;
  conflictResolution: ConflictResolutionStrategy;
  autoSync: boolean;
}

// Result of a sync operation
export interface SyncResult {
  success: boolean;
  error?: string;
  operations?: Array<{
    id: string;
    success: boolean;
    error?: string;
  }>;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: { id: string; email: string } | null;
}