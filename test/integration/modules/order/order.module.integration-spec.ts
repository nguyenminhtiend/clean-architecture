import { Test, TestingModule } from '@nestjs/testing';
import { OrderModule } from '../../../../src/modules/order/order.module';
import { OrderController } from '../../../../src/modules/order/order.controller';
import { ProductModule } from '../../../../src/modules/product/product.module';
import { PrismaService } from '../../../../src/prisma/prisma.service';
import { OrderFactory, ProductFactory } from '../../../helpers';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

// Type assertion helper for order mock
type MockPrismaClient = DeepMockProxy<PrismaClient>;

describe('OrderModule Integration Tests', () => {
  let moduleRef: TestingModule;
  let controller: OrderController;
  let prismaMock: MockPrismaClient;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    moduleRef = await Test.createTestingModule({
      imports: [OrderModule, ProductModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    await moduleRef.init();

    controller = moduleRef.get<OrderController>(OrderController);
  });

  afterEach(async () => {
    await moduleRef.close();
    jest.clearAllMocks();
  });

  describe('Order Creation Flow', () => {
    it('should create an order with product validation', async () => {
      // Arrange
      const createDto = {
        customerName: 'John Doe',
        productId: 'test-product-id',
        quantity: 5,
      };

      const mockProduct = ProductFactory.createPrismaProduct({
        id: createDto.productId,
        price: 100,
        stock: 10,
      });

      const mockOrder = OrderFactory.createPrismaOrder({
        customerName: createDto.customerName,
        totalAmount: 500,
      });

      (prismaMock.product.findUnique as jest.Mock).mockResolvedValue(
        mockProduct,
      );
      ((prismaMock as any).order.create as jest.Mock).mockResolvedValue(
        mockOrder,
      );

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.customerName).toBe(createDto.customerName);
      expect(result.totalAmount).toBe(500);
      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: { id: createDto.productId },
      });
      expect((prismaMock as any).order.create).toHaveBeenCalled();
    });

    it('should fail to create order when product does not exist', async () => {
      // Arrange
      const createDto = {
        customerName: 'John Doe',
        productId: 'non-existent-product',
        quantity: 5,
      };

      (prismaMock.product.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(controller.create(createDto)).rejects.toThrow();
      expect((prismaMock as any).order.create).not.toHaveBeenCalled();
    });
  });

  describe('Order Query Flow', () => {
    it('should get an order through the full query flow', async () => {
      // Arrange
      const orderId = 'test-order-id';
      const mockPrismaOrder = OrderFactory.createPrismaOrder({ id: orderId });
      ((prismaMock as any).order.findUnique as jest.Mock).mockResolvedValue(
        mockPrismaOrder,
      );

      // Act
      const result = await controller.findOne(orderId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(orderId);
      expect((prismaMock as any).order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
      });
    });

    it('should list all orders through the full query flow', async () => {
      // Arrange
      const mockOrders = [
        OrderFactory.createPrismaOrder({ id: '1' }),
        OrderFactory.createPrismaOrder({ id: '2' }),
      ];
      ((prismaMock as any).order.findMany as jest.Mock).mockResolvedValue(
        mockOrders,
      );

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect((prismaMock as any).order.findMany).toHaveBeenCalled();
    });
  });
});
