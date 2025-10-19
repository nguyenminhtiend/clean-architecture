import { TestingModule } from '@nestjs/testing';
import { UpdateOrderHandler } from '../../../../../src/modules/order/commands/update-order.handler';
import { UpdateOrderCommand } from '../../../../../src/modules/order/commands/update-order.command';
import { IOrderRepository } from '../../../../../src/modules/order/interfaces';
import { NotFoundException } from '@nestjs/common';
import {
  OrderFactory,
  createMockRepository,
  createTestModuleBuilder,
} from '../../../../helpers';

describe('UpdateOrderHandler', () => {
  let handler: UpdateOrderHandler;
  let mockRepository: jest.Mocked<IOrderRepository>;

  beforeEach(async () => {
    mockRepository = createMockRepository() as jest.Mocked<IOrderRepository>;

    const module: TestingModule = await createTestModuleBuilder()
      .withProvider(UpdateOrderHandler)
      .withMockProvider('IOrderRepository', mockRepository)
      .build();

    handler = module.get<UpdateOrderHandler>(UpdateOrderHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should update order status successfully', async () => {
      // Arrange
      const command = new UpdateOrderCommand('test-order-id', 'completed');

      const existingOrder = OrderFactory.createOrder({
        id: 'test-order-id',
        status: 'pending',
      });

      const updatedOrder = OrderFactory.createOrder({
        id: 'test-order-id',
        status: 'completed',
      });

      mockRepository.findById.mockResolvedValue(existingOrder);
      mockRepository.update.mockResolvedValue(updatedOrder);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith('test-order-id');
      expect(mockRepository.update).toHaveBeenCalledWith('test-order-id', {
        status: 'completed',
      });
      expect(result.status).toBe('completed');
    });

    it('should update order from pending to completed', async () => {
      // Arrange
      const command = new UpdateOrderCommand('order-123', 'completed');

      const existingOrder = OrderFactory.createOrder({
        id: 'order-123',
        status: 'pending',
      });

      const updatedOrder = OrderFactory.createOrder({
        id: 'order-123',
        status: 'completed',
      });

      mockRepository.findById.mockResolvedValue(existingOrder);
      mockRepository.update.mockResolvedValue(updatedOrder);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result.status).toBe('completed');
    });

    it('should throw NotFoundException when order does not exist', async () => {
      // Arrange
      const command = new UpdateOrderCommand('non-existent-id', 'completed');

      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
      await expect(handler.execute(command)).rejects.toThrow(
        'Order with ID non-existent-id not found',
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should update order to cancelled status', async () => {
      // Arrange
      const command = new UpdateOrderCommand('order-cancel', 'cancelled');

      const existingOrder = OrderFactory.createOrder({
        id: 'order-cancel',
        status: 'pending',
      });

      const updatedOrder = OrderFactory.createOrder({
        id: 'order-cancel',
        status: 'cancelled',
      });

      mockRepository.findById.mockResolvedValue(existingOrder);
      mockRepository.update.mockResolvedValue(updatedOrder);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result.status).toBe('cancelled');
    });

    it('should preserve other order fields when updating status', async () => {
      // Arrange
      const command = new UpdateOrderCommand('order-preserve', 'completed');

      const existingOrder = OrderFactory.createOrder({
        id: 'order-preserve',
        customerName: 'John Doe',
        totalAmount: 299.99,
        status: 'pending',
      });

      const updatedOrder = OrderFactory.createOrder({
        id: 'order-preserve',
        customerName: 'John Doe',
        totalAmount: 299.99,
        status: 'completed',
      });

      mockRepository.findById.mockResolvedValue(existingOrder);
      mockRepository.update.mockResolvedValue(updatedOrder);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result.customerName).toBe('John Doe');
      expect(result.totalAmount).toBe(299.99);
      expect(result.status).toBe('completed');
    });
  });
});
