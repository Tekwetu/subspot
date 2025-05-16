import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../database/database.service';
import type { LoginDto, AuthResponseDto, JwtPayload } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private databaseService: DatabaseService
  ) {}

  async onModuleInit() {
    // Initialize the admin user if not exists
    const email = this.configService.get<string>('USER_EMAIL');
    const password = this.configService.get<string>('USER_PASSWORD');

    if (!email || !password) {
      this.logger.warn('USER_EMAIL or USER_PASSWORD not set. Skipping admin user creation.');
      return;
    }

    try {
      // Check if admin user exists
      const result = await this.databaseService.execute('SELECT id FROM users WHERE email = ?', [
        email,
      ]);

      if (result.rows.length === 0) {
        // Create admin user
        const hashedPassword = await bcrypt.hash(password, 10);
        await this.databaseService.execute(
          'INSERT INTO users (id, email, password) VALUES (?, ?, ?)',
          [uuidv4(), email, hashedPassword]
        );
        this.logger.log(`Admin user created successfully: ${email}`);
      } else {
        this.logger.log(`Admin user already exists: ${email}`);
      }
    } catch (error) {
      this.logger.error('Failed to initialize admin user', error);
    }
  }

  async validateUser(
    email: string,
    password: string
  ): Promise<{ id: string; email: string } | null> {
    try {
      const result = await this.databaseService.execute(
        'SELECT id, email, password FROM users WHERE email = ?',
        [email]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];

      // Validate user structure
      if (
        !user.id ||
        !user.email ||
        !user.password ||
        typeof user.id !== 'string' ||
        typeof user.email !== 'string' ||
        typeof user.password !== 'string'
      ) {
        this.logger.error('Invalid user data structure');
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return null;
      }

      return { id: user.id, email: user.email };
    } catch (error) {
      this.logger.error('Error validating user', error);
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = { sub: user.id, email: user.email };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}
