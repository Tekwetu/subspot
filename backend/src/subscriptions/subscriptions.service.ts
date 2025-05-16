import { Injectable } from '@nestjs/common';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  SubscriptionFilterDto,
} from './dto/subscription.dto';
import { DatabaseService } from '../database/database.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createSubscriptionDto: CreateSubscriptionDto) {
    const id = uuidv4();
    const now = new Date().toISOString();

    const query = `
      INSERT INTO subscriptions (
        id, name, plan, price, currency, billing_cycle, 
        start_date, renewal_date, payment_method, account, 
        category, status, cancellation_info, notes, 
        created_at, updated_at, synced_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *;
    `;

    const result = await this.databaseService.execute(query, [
      id,
      createSubscriptionDto.name,
      createSubscriptionDto.plan || null,
      createSubscriptionDto.price,
      createSubscriptionDto.currency,
      createSubscriptionDto.billing_cycle,
      createSubscriptionDto.start_date,
      createSubscriptionDto.renewal_date,
      createSubscriptionDto.payment_method || null,
      createSubscriptionDto.account || null,
      createSubscriptionDto.category || null,
      createSubscriptionDto.status,
      createSubscriptionDto.cancellation_info || null,
      createSubscriptionDto.notes || null,
      now,
      now,
      now,
    ]);

    return result.rows[0];
  }

  async findAll(filters: SubscriptionFilterDto) {
    let query = 'SELECT * FROM subscriptions';
    const queryParams: any[] = [];
    const conditions: string[] = [];

    if (filters.status) {
      conditions.push('status = ?');
      queryParams.push(filters.status);
    }

    if (filters.category) {
      conditions.push('category = ?');
      queryParams.push(filters.category);
    }

    if (filters.search) {
      conditions.push('(name LIKE ? OR notes LIKE ?)');
      const searchTerm = `%${filters.search}%`;
      queryParams.push(searchTerm, searchTerm);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY renewal_date ASC';

    const result = await this.databaseService.execute(query, queryParams);
    return result.rows;
  }

  async findOne(id: string) {
    const query = 'SELECT * FROM subscriptions WHERE id = ?';
    const result = await this.databaseService.execute(query, [id]);

    if (result.rows.length === 0) {
      throw new Error(`Subscription with ID ${id} not found`);
    }

    return result.rows[0];
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    // First check if the subscription exists
    const checkQuery = 'SELECT id FROM subscriptions WHERE id = ?';
    const checkResult = await this.databaseService.execute(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      throw new Error(`Subscription with ID ${id} not found`);
    }

    // Build update query
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    for (const [key, value] of Object.entries(updateSubscriptionDto)) {
      if (value !== undefined) {
        updateFields.push(`${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`);
        updateValues.push(value);
      }
    }

    // Add updated_at and synced_at
    const now = new Date().toISOString();
    updateFields.push('updated_at = ?', 'synced_at = ?');
    updateValues.push(now, now);

    // Add id at the end for the WHERE clause
    updateValues.push(id);

    const updateQuery = `
      UPDATE subscriptions
      SET ${updateFields.join(', ')}
      WHERE id = ?
      RETURNING *;
    `;

    const updateResult = await this.databaseService.execute(updateQuery, updateValues);
    return updateResult.rows[0];
  }

  async remove(id: string) {
    // First check if the subscription exists
    const checkQuery = 'SELECT id FROM subscriptions WHERE id = ?';
    const checkResult = await this.databaseService.execute(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      throw new Error(`Subscription with ID ${id} not found`);
    }

    // Delete the subscription
    const deleteQuery = 'DELETE FROM subscriptions WHERE id = ? RETURNING id';
    await this.databaseService.execute(deleteQuery, [id]);
    return;
  }
}
