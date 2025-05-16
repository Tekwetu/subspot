import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { DatabaseService } from './database.service';
import { seedDatabase } from './seed';

@Injectable()
export class DatabaseInitService {
  private readonly logger = new Logger(DatabaseInitService.name);

  constructor(private databaseService: DatabaseService) {}

  /**
   * Initialize the database schema and seed data
   */
  async initializeDatabase(): Promise<void> {
    try {
      this.logger.log('Initializing database schema...');

      // Read the schema.sql file
      const schemaPath = join(__dirname, 'schema.sql');
      const schemaSql = readFileSync(schemaPath, 'utf8');

      // Split the schema into separate statements
      const statements = schemaSql
        .split(';')
        .map(statement => statement.trim())
        .filter(statement => statement.length > 0);

      // Execute each statement
      for (const statement of statements) {
        await this.databaseService.execute(`${statement};`);
      }

      this.logger.log('Database schema initialized successfully');

      // Seed the database with sample data
      try {
        await seedDatabase(this.databaseService);
      } catch (seedError) {
        this.logger.error('Error seeding database', seedError);
        // Don't throw here, as we want to continue even if seeding fails
      }
    } catch (error) {
      this.logger.error('Failed to initialize database schema', error);
      throw error;
    }
  }
}
