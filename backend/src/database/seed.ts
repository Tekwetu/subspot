import type { DatabaseService } from './database.service';
import { v4 as uuidv4 } from 'uuid';

export async function seedDatabase(databaseService: DatabaseService) {
  const now = new Date().toISOString();

  // Check if we have existing data
  const result = await databaseService.execute('SELECT COUNT(*) as count FROM subscriptions');
  if (result.rows && result.rows.length > 0 && Number(result.rows[0].count) > 0) {
    console.log('Database already has subscription data, skipping seed');
    return;
  }

  // Example subscription data
  const subscriptions = [
    {
      id: uuidv4(),
      name: 'Netflix',
      plan: 'Standard',
      price: 15.49,
      currency: 'USD',
      billing_cycle: 'monthly',
      start_date: '2023-01-15',
      renewal_date: '2023-07-15',
      payment_method: 'Credit Card',
      account: 'user@example.com',
      category: 'Entertainment',
      status: 'active',
      notes: 'Family plan with 2 screens',
      created_at: now,
      updated_at: now,
      synced_at: now,
    },
    {
      id: uuidv4(),
      name: 'Spotify',
      plan: 'Premium',
      price: 9.99,
      currency: 'USD',
      billing_cycle: 'monthly',
      start_date: '2023-02-10',
      renewal_date: '2023-07-10',
      payment_method: 'PayPal',
      account: 'user@example.com',
      category: 'Entertainment',
      status: 'active',
      notes: 'Student discount',
      created_at: now,
      updated_at: now,
      synced_at: now,
    },
    {
      id: uuidv4(),
      name: 'AWS',
      plan: 'Developer',
      price: 29.99,
      currency: 'USD',
      billing_cycle: 'monthly',
      start_date: '2023-03-20',
      renewal_date: '2023-07-20',
      payment_method: 'Credit Card',
      account: 'dev@example.com',
      category: 'Development',
      status: 'active',
      notes: 'Company reimbursed',
      created_at: now,
      updated_at: now,
      synced_at: now,
    },
    {
      id: uuidv4(),
      name: 'Adobe Creative Cloud',
      plan: 'All Apps',
      price: 52.99,
      currency: 'USD',
      billing_cycle: 'monthly',
      start_date: '2023-01-05',
      renewal_date: '2023-07-05',
      payment_method: 'Credit Card',
      account: 'design@example.com',
      category: 'Design',
      status: 'active',
      notes: 'Annual plan paid monthly',
      created_at: now,
      updated_at: now,
      synced_at: now,
    },
    {
      id: uuidv4(),
      name: 'Notion',
      plan: 'Personal Pro',
      price: 4.0,
      currency: 'USD',
      billing_cycle: 'monthly',
      start_date: '2023-04-15',
      renewal_date: '2023-07-15',
      payment_method: 'Credit Card',
      account: 'user@example.com',
      category: 'Productivity',
      status: 'active',
      notes: null,
      created_at: now,
      updated_at: now,
      synced_at: now,
    },
  ];

  // Insert subscriptions
  for (const subscription of subscriptions) {
    await databaseService.execute(
      `
      INSERT INTO subscriptions (
        id, name, plan, price, currency, billing_cycle, 
        start_date, renewal_date, payment_method, account, 
        category, status, cancellation_info, notes, 
        created_at, updated_at, synced_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        subscription.id,
        subscription.name,
        subscription.plan,
        subscription.price,
        subscription.currency,
        subscription.billing_cycle,
        subscription.start_date,
        subscription.renewal_date,
        subscription.payment_method,
        subscription.account,
        subscription.category,
        subscription.status,
        null, // cancellation_info
        subscription.notes,
        subscription.created_at,
        subscription.updated_at,
        subscription.synced_at,
      ]
    );
  }

  console.log(`Seeded database with ${subscriptions.length} subscriptions`);
}
