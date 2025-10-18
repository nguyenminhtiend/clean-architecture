import { Test, TestingModule } from '@nestjs/testing';
import {
  GetOrderHandler,
  GetOrderQuery,
} from '../../../../../src/modules/order/queries/get-order.handler';
import { IOrderRepository } from '../../../../../src/modules/order/interfaces';
import { OrderFactory } from '../../../../helpers';

describe('GetOrderHandler', () => {
  let handler: GetOrderHandler;
  let mockRepository: jest.Mocked<IOrderRepository>;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOrderHandler,
        {
          provide: 'IOrderRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    handler = module.get<GetOrderHandler>(GetOrderHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return an order successfully', async () => {
      // Arrange
      const orderId = 'test-order-id';
      const query = new GetOrderQuery(orderId);

      const mockOrder = OrderFactory.createOrder({ id: orderId });

      mockRepository.findById.mockResolvedValue(mockOrder);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(orderId);
      expect(result).toEqual({
        id: mockOrder.id,
        customerName: mockOrder.customerName,
        totalAmount: mockOrder.totalAmount,
        status: mockOrder.status,
        items: JSON.parse(mockOrder.items),
        createdAt: mockOrder.createdAt,
        updatedAt: mockOrder.updatedAt,
      });
    });

    it('should throw error when order not found', async () => {
      // Arrange
      const orderId = 'non-existent-id';
      const query = new GetOrderQuery(orderId);

      mockRepository.findById.mockRejectedValue(new Error('Order not found'));

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow('Order not found');
      expect(mockRepository.findById).toHaveBeenCalledWith(orderId);
    });
  });
});
