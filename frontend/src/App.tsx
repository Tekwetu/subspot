import { useState } from 'react';
import { StoreProvider } from './stores/StoreContext';
import { useSubscriptions, type Subscription } from './hooks/useSubscriptions';

// Dashboard component to display subscription data from TinyBase
function Dashboard() {
  const { 
    subscriptionIds, 
    getSubscription, 
    getUpcomingRenewals, 
    calculateMonthlyCost 
  } = useSubscriptions();
  
  const [showTestForm, setShowTestForm] = useState(false);
  
  // Calculate monthly cost
  const monthlyCost = calculateMonthlyCost();
  
  // Get upcoming renewals in the next 30 days
  const upcomingRenewals = getUpcomingRenewals(30);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Subscription Manager</h1>
      
      {/* Summary Cards */}
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
      
      {/* Subscriptions List */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Subscriptions</h2>
        
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
                </tr>
              </thead>
              <tbody>
                {subscriptionIds.map((id: string) => {
                  const sub = getSubscription(id);
                  if (!sub) return null;
                  
                  return (
                    <tr key={id} className="border-b hover:bg-gray-50">
                      <td className="py-2">{sub.name}</td>
                      <td className="py-2">{sub.currency} {sub.price}</td>
                      <td className="py-2">{sub.billingCycle}</td>
                      <td className="py-2">{new Date(sub.renewalDate).toLocaleDateString()}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          sub.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        <button 
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          onClick={() => setShowTestForm(!showTestForm)}
        >
          {showTestForm ? 'Hide Test Form' : 'Show Test Form'}
        </button>
        
        {/* Simple test form to add a subscription */}
        {showTestForm && <TestAddForm />}
      </div>
      
      {/* Upcoming Renewals Section */}
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
                  <span className="text-sm">{new Date(sub.renewalDate).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-600">{sub.currency} {sub.price} ({sub.billingCycle})</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Test form for adding a subscription
function TestAddForm() {
  const { addSubscription } = useSubscriptions();
  
  const handleAddTest = () => {
    const today = new Date();
    const renewal = new Date();
    renewal.setMonth(renewal.getMonth() + 1);
    
    addSubscription({
      name: 'Test Subscription',
      price: 9.99,
      currency: 'USD',
      billingCycle: 'monthly',
      startDate: today.toISOString(),
      renewalDate: renewal.toISOString(),
      status: 'active',
    });
  };
  
  return (
    <div className="mt-4 p-4 border rounded">
      <p className="mb-2">Add a test subscription to see how the app works</p>
      <button 
        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
        onClick={handleAddTest}
      >
        Add Test Subscription
      </button>
    </div>
  );
}

// Main app wrapped with StoreProvider
function App() {
  return (
    <StoreProvider>
      <Dashboard />
    </StoreProvider>
  );
}

export default App;