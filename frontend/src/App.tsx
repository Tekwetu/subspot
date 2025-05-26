import { useState, useCallback } from 'react';
import { StoreProvider } from './stores/StoreContext';
import { useSubscriptions } from './hooks/useSubscriptions';
import type { Subscription } from './types/subscription';
import { SubscriptionForm } from './components/SubscriptionForm';
import { Modal } from './components/Modal';
import { OnlineStatusProvider } from './hooks/useOnlineStatus/OnlineStatusContext';
import { OnlineStatusIndicator } from './components/OnlineStatusIndicator';
import { SyncProvider } from './services/sync/SyncContext';
import { SyncStatusIndicator } from './components/SyncStatusIndicator';
import { AuthProvider } from './services/auth/AuthContext';
import { useAuth } from './services/auth/useAuth';
import { LoginForm } from './components/LoginForm';
import { SubscriptionCard } from './components/SubscriptionCard';
import { MobileHeader } from './components/MobileHeader';

// Dashboard component to display subscription data from TinyBase
function Dashboard() {
  const {
    subscriptionIds,
    getSubscription,
    deleteSubscription,
    getUpcomingRenewals,
    calculateMonthlyCost,
  } = useSubscriptions();

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editSubscriptionId, setEditSubscriptionId] = useState<string | undefined>(undefined);

  // Calculate monthly cost
  const monthlyCost = calculateMonthlyCost();

  // Get upcoming renewals in the next 30 days
  const upcomingRenewals = getUpcomingRenewals(30);

  // Open modal for adding new subscription
  const handleAddNew = () => {
    setEditSubscriptionId(undefined);
    setIsModalOpen(true);
  };

  // Open modal for editing existing subscription
  const handleEdit = (id: string) => {
    setEditSubscriptionId(id);
    setIsModalOpen(true);
  };

  // Close the form modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Handle save completion - make modal closure more reliable
  const handleSaveComplete = useCallback(() => {
    // Use setTimeout to ensure state updates have propagated
    setTimeout(() => {
      setIsModalOpen(false);
    }, 100);
  }, []);

  // Handle subscription deletion with confirmation
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      deleteSubscription(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden">
        <MobileHeader
          onAddNew={handleAddNew}
          totalSubscriptions={subscriptionIds.length}
          monthlyCost={monthlyCost}
          upcomingRenewals={upcomingRenewals.length}
        />
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block max-w-4xl mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Subscription Manager</h1>
          <div className="flex space-x-3">
            <OnlineStatusIndicator />
            <SyncStatusIndicator />
          </div>
        </div>

        {/* Desktop Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-gray-500 text-sm">Active Subscriptions</h2>
            <p className="text-2xl font-bold">{subscriptionIds.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-gray-500 text-sm">Monthly Cost</h2>
            <p className="text-2xl font-bold">${monthlyCost.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-gray-500 text-sm">Upcoming Renewals</h2>
            <p className="text-2xl font-bold">{upcomingRenewals.length}</p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="md:max-w-4xl md:mx-auto">
        {/* Mobile: Subscriptions Grid */}
        <div className="md:hidden px-4 pb-6">
          {subscriptionIds.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-lg mb-4">No subscriptions yet</p>
              <button
                onClick={handleAddNew}
                className="bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors"
              >
                Add Your First Subscription
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptionIds.map((id: string) => {
                const sub = getSubscription(id);
                if (!sub) return null;

                return (
                  <SubscriptionCard
                    key={id}
                    subscription={sub}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                );
              })}
            </div>
          )}

          {/* Mobile: Upcoming Renewals Section */}
          {upcomingRenewals.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4 px-1">Upcoming Renewals</h2>
              <div className="space-y-3">
                {upcomingRenewals.slice(0, 3).map(sub => (
                  <div key={sub.id} className="bg-white rounded-lg p-4 border border-orange-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{sub.name}</h3>
                        <p className="text-sm text-gray-600">
                          {sub.currency} {sub.price} ({sub.billingCycle})
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-orange-600">
                          {sub.renewalDate
                            ? new Date(sub.renewalDate).toLocaleDateString()
                            : 'Invalid Date'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {upcomingRenewals.length > 3 && (
                  <p className="text-center text-sm text-gray-500 py-2">
                    +{upcomingRenewals.length - 3} more renewals
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Desktop: Original Table Layout */}
        <div className="hidden md:block px-8">
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Subscriptions</h2>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                onClick={handleAddNew}
              >
                Add New Subscription
              </button>
            </div>

            {subscriptionIds.length === 0 ? (
              <p className="text-gray-500">No subscriptions added yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Price</th>
                      <th className="text-left py-2">Billing Cycle</th>
                      <th className="text-left py-2">Renewal Date</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptionIds.map((id: string) => {
                      const sub = getSubscription(id);
                      if (!sub) return null;

                      return (
                        <tr key={id} className="border-b hover:bg-gray-50">
                          <td className="py-2">{sub.name}</td>
                          <td className="py-2">
                            {sub.currency} {sub.price}
                          </td>
                          <td className="py-2">{sub.billingCycle || 'N/A'}</td>
                          <td className="py-2">
                            {sub.renewalDate
                              ? new Date(sub.renewalDate).toLocaleDateString()
                              : 'Invalid Date'}
                          </td>
                          <td className="py-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                sub.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-2">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleEdit(id)}
                                className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50"
                                title="Edit"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(id)}
                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                                title="Delete"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M3 6h18"></path>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                  <line x1="10" y1="11" x2="10" y2="17"></line>
                                  <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Desktop: Upcoming Renewals Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Upcoming Renewals</h2>

            {upcomingRenewals.length === 0 ? (
              <p className="text-gray-500">No upcoming renewals in the next 30 days.</p>
            ) : (
              <div className="space-y-4">
                {upcomingRenewals.map((sub: Subscription) => (
                  <div key={sub.id} className="border-b pb-3">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{sub.name}</h3>
                      <span className="text-sm">
                        {sub.renewalDate
                          ? new Date(sub.renewalDate).toLocaleDateString()
                          : 'Invalid Date'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {sub.currency} {sub.price} ({sub.billingCycle || 'N/A'})
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Form Modal - Optimized for mobile */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editSubscriptionId ? 'Edit Subscription' : 'Add New Subscription'}
      >
        <SubscriptionForm
          subscriptionId={editSubscriptionId}
          onSave={handleSaveComplete}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
}

// Main app wrapped with StoreProvider
// Auth-aware app wrapper
function AuthenticatedApp() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Dashboard /> : <LoginForm />;
}

function App() {
  return (
    <StoreProvider>
      <AuthProvider>
        <OnlineStatusProvider>
          <SyncProvider>
            <AuthenticatedApp />
          </SyncProvider>
        </OnlineStatusProvider>
      </AuthProvider>
    </StoreProvider>
  );
}

export default App;
