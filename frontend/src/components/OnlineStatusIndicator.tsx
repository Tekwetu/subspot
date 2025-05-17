import { useOnlineStatusContext } from '../hooks/useOnlineStatus/useOnlineStatusContext';

/**
 * Component that displays the current online/offline status
 * with appropriate visual indicators
 */
export function OnlineStatusIndicator() {
  const { isOnline } = useOnlineStatusContext();

  return (
    <div className="flex items-center">
      <div
        className={`h-3 w-3 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}
        aria-hidden="true"
      />
      <span className="text-sm">{isOnline ? 'Online' : 'Offline'}</span>
    </div>
  );
}
