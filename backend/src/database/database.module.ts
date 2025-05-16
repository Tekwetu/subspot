import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { DatabaseInitService } from './init-db';

@Module({
  imports: [ConfigModule],
  providers: [DatabaseService, DatabaseInitService],
  exports: [DatabaseService, DatabaseInitService],
})
export class DatabaseModule {}
