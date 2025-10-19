import { Test, TestingModule } from '@nestjs/testing';
import { OrderRepository } from '../../../../../../src/modules/order/infrastructure/repositories/order.repository';
import { PrismaService } from '../../../../../../src/prisma/prisma.service';
import { EntityNotFoundException } from '../../../../../../src/shared/exceptions/entity-not-found.exception';
import { OrderFactory } from '../../../../../helpers';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

describe('OrderRepository', () => {
  let repository: OrderRepository;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderRepository,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    repository = module.get<OrderRepository>(OrderRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an order successfully', async () => {
      // Arrange
      const createData = {
        customerName: 'John Doe',
        totalAmount: 1000,
        status: 'pending',
        items: JSON.stringify([{ productId: '1', quantity: 2 }]),
      };

      const mockPrismaOrder = OrderFactory.createPrismaOrder(createData);
      (prismaMock.order.create as jest.Mock).mockResolvedValue(mockPrismaOrder);

      // Act
      const result = await repository.create(createData);

      // Assert
      expect(prismaMock.order.create).toHaveBeenCalledWith({
        data: createData,
      });
      expect(result.customerName).toBe(createData.customerName);
      expect(result.totalAmount).toBe(createData.totalAmount);
    });

    it('should create order with default status when not provided', async () => {
      // Arrange
      const createData = {
        customerName: 'John Doe',
        totalAmount: 1000,
      };

      const mockPrismaOrder = OrderFactory.createPrismaOrder({
        ...createData,
        status: 'pending',
        items: '[]',
      });
      (prismaMock.order.create as jest.Mock).mockResolvedValue(mockPrismaOrder);

      // Act
      const result = await repository.create(createData);

      // Assert
      expect(prismaMock.order.create).toHaveBeenCalledWith({
        data: {
          customerName: createData.customerName,
          totalAmount: createData.totalAmount,
          status: 'pending',
          items: '[]',
        },
      });
      expect(result.status).toBe('pending');
    });
  });

  describe('findById', () => {
    it('should return an order when found', async () => {
      // Arrange
      const orderId = 'test-order-id';
      const mockPrismaOrder = OrderFactory.createPrismaOrder({ id: orderId });
      (prismaMock.order.findUnique as jest.Mock).mockResolvedValue(mockPrismaOrder);

      // Act
      const result = await repository.findById(orderId);

      // Assert
      expect(prismaMock.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
      });
      expect(result.id).toBe(orderId);
    });

    it('should throw EntityNotFoundException when order not found', async () => {
      // Arrange
      const orderId = 'non-existent-id';
      (prismaMock.order.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(repository.findById(orderId)).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      // Arrange
      const mockOrders = [
        OrderFactory.createPrismaOrder({ id: '1' }),
        OrderFactory.createPrismaOrder({ id: '2' }),
      ];
      (prismaMock.order.findMany as jest.Mock).mockResolvedValue(mockOrders);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(prismaMock.order.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(2);
    });

    it('should return paginated orders', async () => {
      // Arrange
      const params = { skip: 5, take: 10 };
      const mockOrders = [OrderFactory.createPrismaOrder({ id: '1' })];
      (prismaMock.order.findMany as jest.Mock).mockResolvedValue(mockOrders);

      // Act
      await repository.findAll(params);

      // Assert
      expect(prismaMock.order.findMany).toHaveBeenCalledWith({
        skip: 5,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('update', () => {
    it('should update an order successfully', async () => {
      // Arrange
      const orderId = 'test-order-id';
      const updateData = { status: 'completed' };

      const existingOrder = OrderFactory.createPrismaOrder({ id: orderId });
      const updatedOrder = OrderFactory.createPrismaOrder({
        ...existingOrder,
        ...updateData,
      });

      (prismaMock.order.findUnique as jest.Mock).mockResolvedValue(existingOrder);
      (prismaMock.order.update as jest.Mock).mockResolvedValue(updatedOrder);

      // Act
      const result = await repository.update(orderId, updateData);

      // Assert
      expect(prismaMock.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: updateData,
      });
      expect(result.status).toBe('completed');
    });

    it('should throw error when updating non-existent order', async () => {
      // Arrange
      const orderId = 'non-existent-id';
      const updateData = { status: 'completed' };

      (prismaMock.order.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(repository.update(orderId, updateData)).rejects.toThrow(EntityNotFoundException);
      expect(prismaMock.order.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete an order successfully', async () => {
      // Arrange
      const orderId = 'test-order-id';
      const mockOrder = OrderFactory.createPrismaOrder({ id: orderId });

      (prismaMock.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
      (prismaMock.order.delete as jest.Mock).mockResolvedValue(mockOrder);

      // Act
      const result = await repository.delete(orderId);

      // Assert
      expect(prismaMock.order.delete).toHaveBeenCalledWith({
        where: { id: orderId },
      });
      expect(result.id).toBe(orderId);
    });

    it('should throw error when deleting non-existent order', async () => {
      // Arrange
      const orderId = 'non-existent-id';

      (prismaMock.order.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(repository.delete(orderId)).rejects.toThrow(EntityNotFoundException);
      expect(prismaMock.order.delete).not.toHaveBeenCalled();
    });
  });
});
