import { useSyncContext } from '../services/sync/useSyncContext';
import { SyncStatus } from '../services/sync/types';

/**
 * Displays the current sync status with appropriate visual indicators
 */
export function SyncStatusIndicator() {
  const { syncStatus, pendingChanges, sync } = useSyncContext();

  // Determine status-specific elements
  const getStatusIcon = () => {
    switch (syncStatus) {
      case SyncStatus.SYNCING:
        return (
          <svg
            className="animate-spin h-4 w-4 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        );
      case SyncStatus.OFFLINE:
        return (
          <svg
            className="h-4 w-4 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m-10.672 0a9 9 0 010-12.728"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072m-6.142 0a5 5 0 010-7.072"
            />
            <line x1="1" y1="1" x2="23" y2="23" strokeWidth={2} stroke="currentColor" />
          </svg>
        );
      case SyncStatus.ERROR:
        return (
          <svg
            className="h-4 w-4 text-red-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      case SyncStatus.IDLE:
      default:
        return (
          <svg
            className="h-4 w-4 text-green-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case SyncStatus.SYNCING:
        return 'Syncing...';
      case SyncStatus.OFFLINE:
        return 'Offline';
      case SyncStatus.ERROR:
        return 'Sync Error';
      case SyncStatus.IDLE:
      default:
        return pendingChanges > 0 ? `${pendingChanges} changes pending` : 'Synced';
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case SyncStatus.SYNCING:
        return 'text-blue-700';
      case SyncStatus.OFFLINE:
        return 'text-gray-500';
      case SyncStatus.ERROR:
        return 'text-red-700';
      case SyncStatus.IDLE:
      default:
        return pendingChanges > 0 ? 'text-yellow-700' : 'text-green-700';
    }
  };

  // Trigger a manual sync
  const handleManualSync = () => {
    if (syncStatus !== SyncStatus.SYNCING) {
      sync().catch(console.error);
    }
  };

  return (
    <div
      className={`flex items-center ${getStatusColor()} bg-white py-1 px-3 rounded-full shadow-sm border border-gray-200 text-sm`}
    >
      <div className="mr-2">{getStatusIcon()}</div>
      <span>{getStatusText()}</span>

      {/* Only show sync button if we have pending changes and we're not already syncing */}
      {pendingChanges > 0 && syncStatus !== SyncStatus.SYNCING && (
        <button
          onClick={handleManualSync}
          className="ml-2 p-1 hover:bg-gray-100 rounded-full"
          title="Sync now"
        >
          <svg
            className="h-3 w-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
