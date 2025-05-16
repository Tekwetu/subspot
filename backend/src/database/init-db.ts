import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { DatabaseService } from './database.service';

@Injectable()
export class DatabaseInitService {
  private readonly logger = new Logger(DatabaseInitService.name);

  constructor(private databaseService: DatabaseService) {}

  /**
   * Initialize the database schema
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
    } catch (error) {
      this.logger.error('Failed to initialize database schema', error);
      throw error;
    }
  }
}