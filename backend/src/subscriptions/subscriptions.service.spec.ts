import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { SubscriptionsService } from './subscriptions.service';
import { DatabaseService } from '../database/database.service';
import type {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  SubscriptionFilterDto,
} from './dto/subscription.dto';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let databaseService: DatabaseService;

  const mockDatabaseService = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

      const mockResult = {
        id: '123',
        ...dto,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      };

      jest.spyOn(mockDatabaseService, 'execute').mockResolvedValue({
        rows: [mockResult],
      });

      // Act
      const result = await service.create(dto);

      // Assert
      expect(result).toEqual(mockResult);
      expect(mockDatabaseService.execute).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all subscriptions with filters applied', async () => {
      const filters: SubscriptionFilterDto = {
        status: 'active',
      };

      const mockResult = [
        {
          id: '123',
          name: 'Netflix',
          price: 9.99,
          currency: 'USD',
          billing_cycle: 'monthly',
          start_date: '2023-01-01',
          renewal_date: '2023-02-01',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          synced_at: new Date().toISOString(),
        },
      ];

      jest.spyOn(mockDatabaseService, 'execute').mockResolvedValue({
        rows: mockResult,
      });

      // Act
      const result = await service.findAll(filters);

      // Assert
      expect(result).toEqual(mockResult);
      expect(mockDatabaseService.execute).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a subscription by id', async () => {
      const id = '123';
      const mockResult = {
        id,
        name: 'Netflix',
        price: 9.99,
        currency: 'USD',
        billing_cycle: 'monthly',
        start_date: '2023-01-01',
        renewal_date: '2023-02-01',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      };

      jest.clearAllMocks(); // Clear previous mock calls
      jest.spyOn(mockDatabaseService, 'execute').mockResolvedValue({
        rows: [mockResult],
      });

      // Act
      const result = await service.findOne(id);

      // Assert
      expect(result).toEqual(mockResult);
      expect(mockDatabaseService.execute).toHaveBeenCalledWith(expect.any(String), [id]);
    });

    it('should throw an error if subscription is not found', async () => {
      const id = 'non-existent-id';

      jest.clearAllMocks(); // Clear previous mock calls
      jest.spyOn(mockDatabaseService, 'execute').mockResolvedValue({
        rows: [],
      });

      // Act & Assert
      await expect(service.findOne(id)).rejects.toThrow();
      expect(mockDatabaseService.execute).toHaveBeenCalledWith(expect.any(String), [id]);
    });
  });

  describe('update', () => {
    it('should update a subscription', async () => {
      const id = '123';
      const dto: UpdateSubscriptionDto = {
        price: 12.99,
        renewal_date: '2023-03-01',
      };

      const mockResult = {
        id,
        name: 'Netflix',
        price: 12.99,
        currency: 'USD',
        billing_cycle: 'monthly',
        start_date: '2023-01-01',
        renewal_date: '2023-03-01',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      };

      jest.clearAllMocks(); // Clear previous mock calls
      jest
        .spyOn(mockDatabaseService, 'execute')
        .mockResolvedValueOnce({ rows: [{ id }] }) // For the check if subscription exists
        .mockResolvedValueOnce({ rows: [mockResult] }); // For the update operation

      // Act
      const result = await service.update(id, dto);

      // Assert
      expect(result).toEqual(mockResult);
      expect(mockDatabaseService.execute).toHaveBeenCalledTimes(2);
    });

    it('should throw an error if subscription to update is not found', async () => {
      const id = 'non-existent-id';
      const dto: UpdateSubscriptionDto = {
        price: 12.99,
      };

      jest.clearAllMocks(); // Clear previous mock calls
      jest.spyOn(mockDatabaseService, 'execute').mockResolvedValue({
        rows: [],
      });

      // Act & Assert
      await expect(service.update(id, dto)).rejects.toThrow();
      expect(mockDatabaseService.execute).toHaveBeenCalledWith(expect.any(String), [id]);
    });
  });

  describe('remove', () => {
    it('should remove a subscription', async () => {
      const id = '123';

      jest.clearAllMocks(); // Clear previous mock calls
      jest
        .spyOn(mockDatabaseService, 'execute')
        .mockResolvedValueOnce({ rows: [{ id }] }) // For the check if subscription exists
        .mockResolvedValueOnce({ rows: [{ id }] }); // For the delete operation

      // Act
      await service.remove(id);

      // Assert
      expect(mockDatabaseService.execute).toHaveBeenCalledTimes(2);
      expect(mockDatabaseService.execute).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('DELETE FROM subscriptions'),
        [id]
      );
    });

    it('should throw an error if subscription to remove is not found', async () => {
      const id = 'non-existent-id';

      jest.clearAllMocks(); // Clear previous mock calls
      jest.spyOn(mockDatabaseService, 'execute').mockResolvedValue({
        rows: [],
      });

      // Act & Assert
      await expect(service.remove(id)).rejects.toThrow();
      expect(mockDatabaseService.execute).toHaveBeenCalledWith(expect.any(String), [id]);
    });
  });
});
