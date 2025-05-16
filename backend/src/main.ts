import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { DatabaseInitService } from './database/init-db';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Initialize the database
  const dbInitService = app.get(DatabaseInitService);
  await dbInitService.initializeDatabase();

  // Initialize the auth service (creates admin user if needed)
  const authService = app.get(AuthService);
  await authService.onModuleInit();

  // Start the server
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}
void bootstrap();
