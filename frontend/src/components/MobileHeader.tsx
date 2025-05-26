import { useState } from 'react';
import { OnlineStatusIndicator } from './OnlineStatusIndicator';
import { SyncStatusIndicator } from './SyncStatusIndicator';

interface MobileHeaderProps {
  onAddNew: () => void;
  totalSubscriptions: number;
  monthlyCost: number;
  upcomingRenewals: number;
}

export function MobileHeader({
  onAddNew,
  totalSubscriptions,
  monthlyCost,
  upcomingRenewals,
}: MobileHeaderProps) {
  const [showStats, setShowStats] = useState(false);

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
      {/* Header */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Subscriptions</h1>
            <p className="text-sm text-gray-500">{totalSubscriptions} active</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              title="Toggle stats"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </button>

            <OnlineStatusIndicator />
            <SyncStatusIndicator />

            <button
              onClick={onAddNew}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
              title="Add subscription"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable stats */}
      {showStats && (
        <div className="px-4 pb-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 font-medium">TOTAL</p>
              <p className="text-lg font-bold text-blue-900">{totalSubscriptions}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-600 font-medium">MONTHLY</p>
              <p className="text-lg font-bold text-green-900">${monthlyCost.toFixed(0)}</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-xs text-orange-600 font-medium">UPCOMING</p>
              <p className="text-lg font-bold text-orange-900">{upcomingRenewals}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
