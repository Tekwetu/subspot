export const tablesSchema = {
  subscriptions: {
    name: { type: 'string' },
    plan: { type: 'string', optional: true },
    price: { type: 'number' },
    currency: { type: 'string', default: 'USD' },
    billingCycle: { type: 'string' }, // 'monthly', 'yearly', etc.
    startDate: { type: 'string' }, // ISO date string
    renewalDate: { type: 'string' }, // ISO date string
    paymentMethod: { type: 'string', optional: true },
    accountEmail: { type: 'string', optional: true },
    category: { type: 'string', optional: true },
    status: { type: 'string', default: 'active' }, // 'active', 'cancelled'
    cancellationInfo: { type: 'string', optional: true },
    notes: { type: 'string', optional: true },
    // For sync purposes
    lastModified: { type: 'number' }, // timestamp
  },
} as const;

// Define the schema for application values
export const valuesSchema = {
  // Global settings
  reminderLeadTime: { type: 'number', default: 7 }, // days before renewal
  syncStatus: { type: 'string', default: 'idle' }, // 'idle', 'syncing', 'error'
  lastSyncTime: { type: 'number', optional: true }, // timestamp
  onlineStatus: { type: 'boolean', default: false },
} as const;

// Export the schema types for type safety throughout the application
export type AppTablesSchema = typeof tablesSchema;
export type AppValuesSchema = typeof valuesSchema;

// Combined schema type for convenience
export type AppSchema = [AppTablesSchema, AppValuesSchema];