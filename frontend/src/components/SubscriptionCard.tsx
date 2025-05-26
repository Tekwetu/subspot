import type { Subscription } from '../types/subscription';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SubscriptionCard({ subscription, onEdit, onDelete }: SubscriptionCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getDaysUntilRenewal = () => {
    if (!subscription.renewalDate) return null;
    const today = new Date();
    const renewal = new Date(subscription.renewalDate);
    const diffTime = renewal.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilRenewal = getDaysUntilRenewal();
  const isRenewalSoon = daysUntilRenewal !== null && daysUntilRenewal <= 7 && daysUntilRenewal >= 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      {/* Header with name and status */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{subscription.name}</h3>
          {subscription.plan && (
            <p className="text-sm text-gray-500 truncate">{subscription.plan}</p>
          )}
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            subscription.status === 'active'
              ? 'bg-green-100 text-green-800'
              : subscription.status === 'cancelled'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
          }`}
        >
          {subscription.status}
        </span>
      </div>

      {/* Price and billing info */}
      <div className="mb-4">
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-bold text-gray-900">
            {subscription.currency} {subscription.price}
          </span>
          <span className="text-sm text-gray-500">/{subscription.billingCycle || 'month'}</span>
        </div>
      </div>

      {/* Renewal info */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Next renewal</span>
          <div className="text-right">
            <div className={`font-medium ${isRenewalSoon ? 'text-orange-600' : 'text-gray-900'}`}>
              {formatDate(subscription.renewalDate || '')}
            </div>
            {daysUntilRenewal !== null && (
              <div className={`text-xs ${isRenewalSoon ? 'text-orange-500' : 'text-gray-500'}`}>
                {daysUntilRenewal === 0
                  ? 'Today'
                  : daysUntilRenewal === 1
                    ? 'Tomorrow'
                    : daysUntilRenewal > 0
                      ? `in ${daysUntilRenewal} days`
                      : `${Math.abs(daysUntilRenewal)} days ago`}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(subscription.id)}
          className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(subscription.id)}
          className="flex-1 bg-red-50 text-red-700 hover:bg-red-100 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
        >
          Delete
        </button>
      </div>

      {/* Warning indicator for soon renewals */}
      {isRenewalSoon && (
        <div className="mt-3 flex items-center space-x-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs font-medium">Renewal coming up!</span>
        </div>
      )}
    </div>
  );
}
