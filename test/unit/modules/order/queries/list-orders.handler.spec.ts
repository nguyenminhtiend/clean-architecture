import { Test, TestingModule } from '@nestjs/testing';
import {
  ListOrdersHandler,
  ListOrdersQuery,
} from '../../../../../src/modules/order/queries/list-orders.handler';
import { IOrderRepository } from '../../../../../src/modules/order/interfaces';
import {
  OrderFactory,
  createMockRepository,
  createTestModuleBuilder,
} from '../../../../helpers';

describe('ListOrdersHandler', () => {
  let handler: ListOrdersHandler;
  let mockRepository: jest.Mocked<IOrderRepository>;

  beforeEach(async () => {
    mockRepository = createMockRepository() as jest.Mocked<IOrderRepository>;

    const module: TestingModule = await createTestModuleBuilder()
      .withProvider(ListOrdersHandler)
      .withMockProvider('IOrderRepository', mockRepository)
      .build();

    handler = module.get<ListOrdersHandler>(ListOrdersHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should list all orders without pagination', async () => {
      // Arrange
      const query = new ListOrdersQuery();

      const mockOrders = [
        OrderFactory.createOrder({ id: '1', customerId: 'customer-1' }),
        OrderFactory.createOrder({ id: '2', customerId: 'customer-2' }),
        OrderFactory.createOrder({ id: '3', customerId: 'customer-3' }),
      ];

      mockRepository.findAll.mockResolvedValue(mockOrders);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(mockRepository.findAll).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
      });
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
      expect(result[2].id).toBe('3');
    });

    it('should list orders with pagination', async () => {
      // Arrange
      const query = new ListOrdersQuery(10, 5);

      const mockOrders = [
        OrderFactory.createOrder({ id: '11', customerId: 'customer-11' }),
        OrderFactory.createOrder({ id: '12', customerId: 'customer-12' }),
      ];

      mockRepository.findAll.mockResolvedValue(mockOrders);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(mockRepository.findAll).toHaveBeenCalledWith({
        skip: 10,
        take: 5,
      });
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no orders found', async () => {
      // Arrange
      const query = new ListOrdersQuery();

      mockRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should list orders with only skip parameter', async () => {
      // Arrange
      const query = new ListOrdersQuery(20);

      const mockOrders = [
        OrderFactory.createOrder({ id: '21', customerId: 'customer-21' }),
      ];

      mockRepository.findAll.mockResolvedValue(mockOrders);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(mockRepository.findAll).toHaveBeenCalledWith({
        skip: 20,
        take: undefined,
      });
      expect(result).toHaveLength(1);
    });

    it('should list orders with only take parameter', async () => {
      // Arrange
      const query = new ListOrdersQuery(undefined, 10);

      const mockOrders = Array.from({ length: 10 }, (_, i) =>
        OrderFactory.createOrder({
          id: `${i + 1}`,
          customerId: `customer-${i + 1}`,
        }),
      );

      mockRepository.findAll.mockResolvedValue(mockOrders);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(mockRepository.findAll).toHaveBeenCalledWith({
        skip: undefined,
        take: 10,
      });
      expect(result).toHaveLength(10);
    });

    it('should return orders with all fields mapped correctly', async () => {
      // Arrange
      const query = new ListOrdersQuery();

      const mockOrders = [
        OrderFactory.createOrder({
          id: 'order-1',
          customerName: 'John Doe',
          totalAmount: 199.99,
          status: 'pending',
        }),
      ];

      mockRepository.findAll.mockResolvedValue(mockOrders);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result[0]).toEqual({
        id: 'order-1',
        customerName: 'John Doe',
        totalAmount: 199.99,
        status: 'pending',
        items: expect.any(Array),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should handle orders with different statuses', async () => {
      // Arrange
      const query = new ListOrdersQuery();

      const mockOrders = [
        OrderFactory.createOrder({ id: '1', status: 'pending' }),
        OrderFactory.createOrder({ id: '2', status: 'completed' }),
        OrderFactory.createOrder({ id: '3', status: 'cancelled' }),
      ];

      mockRepository.findAll.mockResolvedValue(mockOrders);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].status).toBe('pending');
      expect(result[1].status).toBe('completed');
      expect(result[2].status).toBe('cancelled');
    });
  });
});
