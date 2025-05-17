import { useState, useEffect } from 'react';
import { useSubscriptions } from '../hooks/useSubscriptions';

interface SubscriptionFormProps {
  subscriptionId?: string; // If provided, edit mode; if not, add mode
  onSave?: (id: string) => void;
  onCancel?: () => void;
}

export function SubscriptionForm({ subscriptionId, onSave, onCancel }: SubscriptionFormProps) {
  const { getSubscription, addSubscription, updateSubscription } = useSubscriptions();
  const isEditMode = !!subscriptionId;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    plan: '',
    price: 0,
    currency: 'USD',
    billingCycle: 'monthly',
    startDate: '',
    renewalDate: '',
    paymentMethod: '',
    accountEmail: '',
    category: '',
    status: 'active',
    cancellationInfo: '',
    notes: '',
  });

  // Validation state
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

  // Load subscription data if in edit mode
  useEffect(() => {
    if (isEditMode && subscriptionId) {
      const subscription = getSubscription(subscriptionId);
      if (subscription) {
        // Format dates for date inputs (YYYY-MM-DD)
        const formatDate = (dateString: string) => {
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };

        setFormData({
          name: subscription.name,
          plan: subscription.plan || '',
          price: subscription.price,
          currency: subscription.currency,
          billingCycle: subscription.billingCycle,
          startDate: formatDate(subscription.startDate),
          renewalDate: formatDate(subscription.renewalDate),
          paymentMethod: subscription.paymentMethod || '',
          accountEmail: subscription.accountEmail || '',
          category: subscription.category || '',
          status: subscription.status,
          cancellationInfo: subscription.cancellationInfo || '',
          notes: subscription.notes || '',
        });
      }
    } else {
      // Set default dates for new subscription
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      setFormData(prevData => ({
        ...prevData,
        startDate: today.toISOString().split('T')[0],
        renewalDate: nextMonth.toISOString().split('T')[0],
      }));
    }
  }, [isEditMode, subscriptionId, getSubscription]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    // Handle numeric inputs
    if (type === 'number') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Clear error when field is edited
    if (errors[name as keyof typeof formData]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.billingCycle) newErrors.billingCycle = 'Billing cycle is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.renewalDate) newErrors.renewalDate = 'Renewal date is required';

    // Validate renewal date is after start date
    if (formData.startDate && formData.renewalDate) {
      const start = new Date(formData.startDate);
      const renewal = new Date(formData.renewalDate);
      if (renewal < start) {
        newErrors.renewalDate = 'Renewal date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Convert dates to ISO strings
    const formattedData = {
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      renewalDate: new Date(formData.renewalDate).toISOString(),
    };

    let id: string;
    if (isEditMode && subscriptionId) {
      // Update existing subscription
      updateSubscription(subscriptionId, formattedData);
      id = subscriptionId;
    } else {
      // Add new subscription
      id = addSubscription(formattedData);
    }

    // Call onSave callback with the subscription ID
    if (onSave) onSave(id);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">
        {isEditMode ? 'Edit Subscription' : 'Add New Subscription'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information Section */}
        <div className="space-y-2">
          <h3 className="text-md font-medium text-gray-700">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 ${
                  errors.name ? 'border-red-300' : ''
                }`}
                required
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Plan/Tier */}
            <div>
              <label htmlFor="plan" className="block text-sm font-medium text-gray-700">
                Plan/Tier
              </label>
              <input
                type="text"
                id="plan"
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 ${
                  errors.price ? 'border-red-300' : ''
                }`}
                required
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>

            {/* Currency */}
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                Currency <span className="text-red-500">*</span>
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                required
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
                <option value="JPY">JPY</option>
              </select>
            </div>

            {/* Billing Cycle */}
            <div>
              <label htmlFor="billingCycle" className="block text-sm font-medium text-gray-700">
                Billing Cycle <span className="text-red-500">*</span>
              </label>
              <select
                id="billingCycle"
                name="billingCycle"
                value={formData.billingCycle}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 ${
                  errors.billingCycle ? 'border-red-300' : ''
                }`}
                required
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="quarterly">Quarterly</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
              </select>
              {errors.billingCycle && (
                <p className="mt-1 text-sm text-red-600">{errors.billingCycle}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 ${
                  errors.startDate ? 'border-red-300' : ''
                }`}
                required
              />
              {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
            </div>

            {/* Renewal Date */}
            <div>
              <label htmlFor="renewalDate" className="block text-sm font-medium text-gray-700">
                Renewal Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="renewalDate"
                name="renewalDate"
                value={formData.renewalDate}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 ${
                  errors.renewalDate ? 'border-red-300' : ''
                }`}
                required
              />
              {errors.renewalDate && (
                <p className="mt-1 text-sm text-red-600">{errors.renewalDate}</p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="space-y-2">
          <h3 className="text-md font-medium text-gray-700">Additional Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Method */}
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                Payment Method
              </label>
              <input
                type="text"
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
              />
            </div>

            {/* Account Email/Username */}
            <div>
              <label htmlFor="accountEmail" className="block text-sm font-medium text-gray-700">
                Account Email/Username
              </label>
              <input
                type="text"
                id="accountEmail"
                name="accountEmail"
                value={formData.accountEmail}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                required
              >
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Cancellation Info */}
          <div>
            <label htmlFor="cancellationInfo" className="block text-sm font-medium text-gray-700">
              Cancellation Link/Notes
            </label>
            <input
              type="text"
              id="cancellationInfo"
              name="cancellationInfo"
              value={formData.cancellationInfo}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isEditMode ? 'Update' : 'Add'} Subscription
          </button>
        </div>
      </form>
    </div>
  );
}
