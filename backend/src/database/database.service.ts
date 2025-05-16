import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, Client, ResultSet } from '@libsql/client';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private client: Client;
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('TURSO_DATABASE_URL');
    const authToken = this.configService.get<string>('TURSO_AUTH_TOKEN');

    if (!url) {
      throw new Error('TURSO_DATABASE_URL environment variable is not set');
    }

    // Configuration object for the client
    const config: any = { url };
    
    // Only add authToken for remote Turso databases, not for local SQLite files
    if (authToken && !url.startsWith('file:')) {
      config.authToken = authToken;
    }

    this.client = createClient(config);
    this.logger.log(`Initializing database with URL: ${url}`);
  }

  async onModuleInit() {
    try {
      // Test the database connection
      await this.execute('SELECT 1');
      this.logger.log('Database connection established successfully');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  /**
   * Execute a SQL query
   * @param sql The SQL query to execute
   * @param params The parameters for the SQL query
   * @returns The result of the query
   */
  async execute(sql: string, params: any[] = []): Promise<ResultSet> {
    try {
      return await this.client.execute({
        sql,
        args: params,
      });
    } catch (error) {
      this.logger.error(`Error executing SQL query: ${sql}`, error);
      throw error;
    }
  }

  /**
   * Execute a batch of SQL queries in a transaction
   * @param queries Array of SQL queries with their parameters
   * @returns Array of results for each query
   */
  async executeTransaction(queries: { sql: string; params?: any[] }[]): Promise<ResultSet[]> {
    return this.client.batch(
      queries.map(query => ({
        sql: query.sql,
        args: query.params || [],
      }))
    );
  }
}
