import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  // Remove unused variables
  // let configService: ConfigService;
  // let databaseService: DatabaseService;

  beforeEach(async () => {
    const mockJwtService = {
      sign: jest.fn().mockReturnValue('test-token'),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'USER_EMAIL') return 'admin@example.com';
        if (key === 'USER_PASSWORD') return 'password';
        return null;
      }),
    };

    const mockDatabaseService = {
      execute: jest.fn().mockResolvedValue({ rows: [] }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    // Remove assignments to unused variables
    // configService = module.get<ConfigService>(ConfigService);
    // databaseService = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException for invalid credentials', async () => {
      // Mock validateUser to return null
      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      const loginDto = { email: 'test@example.com', password: 'wrong' };
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return access token for valid credentials', async () => {
      // Mock validateUser to return a user
      const mockUser = { id: '123', email: 'test@example.com' };
      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser);

      const loginDto = { email: 'test@example.com', password: 'correct' };
      const result = await service.login(loginDto);

      // Create a spy for the sign method
      const signSpy = jest.spyOn(jwtService, 'sign');
      expect(signSpy).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual({
        access_token: 'test-token',
        user: mockUser,
      });
    });
  });
});
