import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn().mockResolvedValue({ access_token: 'test-token' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call authService.login when login is called', async () => {
    // Create a spy for the login method
    const loginSpy = jest.spyOn(authService, 'login');

    const loginDto = { email: 'test@example.com', password: 'test' };
    await controller.login(loginDto);

    // Use the spy for verification
    expect(loginSpy).toHaveBeenCalledWith(loginDto);
  });
});
