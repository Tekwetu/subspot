import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import type {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  SubscriptionFilterDto,
} from './dto/subscription.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('SubscriptionsController', () => {
  let controller: SubscriptionsController;
  let service: SubscriptionsService;

  const mockSubscriptionsService = {
    create: jest
      .fn()
      .mockImplementation((dto: CreateSubscriptionDto) => Promise.resolve({ ...dto, id: '123' })),
    findAll: jest.fn().mockImplementation(() => Promise.resolve([])),
    findOne: jest.fn().mockImplementation((id: string) => Promise.resolve({ id })),
    update: jest
      .fn()
      .mockImplementation((id: string, dto: UpdateSubscriptionDto) =>
        Promise.resolve({ id, ...dto })
      ),
    remove: jest.fn().mockImplementation(() => Promise.resolve()),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionsController],
      providers: [
        {
          provide: SubscriptionsService,
          useValue: mockSubscriptionsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SubscriptionsController>(SubscriptionsController);
    service = module.get<SubscriptionsService>(SubscriptionsService);

    // Reset mock call counts
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a subscription', async () => {
      const dto: CreateSubscriptionDto = {
        name: 'Netflix',
        price: 9.99,
        currency: 'USD',
        billing_cycle: 'monthly',
        start_date: '2023-01-01',
        renewal_date: '2023-02-01',
        status: 'active',
      };

      const result = await controller.create(dto);

      expect(result).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return an array of subscriptions', async () => {
      const filters: SubscriptionFilterDto = { status: 'active' };

      const result = await controller.findAll(filters);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBeTruthy();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe('findOne', () => {
    it('should return a subscription by id', async () => {
      const id = '123';

      const result = await controller.findOne(id);

      expect(result).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update a subscription', async () => {
      const id = '123';
      const dto: UpdateSubscriptionDto = {
        price: 12.99,
        renewal_date: '2023-03-01',
      };

      const result = await controller.update(id, dto);

      expect(result).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.update).toHaveBeenCalledWith(id, dto);
    });
  });

  describe('remove', () => {
    it('should remove a subscription', async () => {
      const id = '123';

      await controller.remove(id);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});
