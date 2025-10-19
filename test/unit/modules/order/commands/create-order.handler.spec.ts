import { TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import {
  CreateOrderHandler,
  CreateOrderCommand,
} from '../../../../../src/modules/order/commands/create-order.handler';
import { IOrderRepository } from '../../../../../src/modules/order/interfaces';
import { IProductService } from '../../../../../src/shared';
import {
  OrderFactory,
  ProductFactory,
  createMockRepository,
  createTestModuleBuilder,
} from '../../../../helpers';

describe('CreateOrderHandler', () => {
  let handler: CreateOrderHandler;
  let mockOrderRepository: jest.Mocked<IOrderRepository>;
  let mockProductService: jest.Mocked<IProductService>;

  beforeEach(async () => {
    mockOrderRepository = createMockRepository() as jest.Mocked<IOrderRepository>;
    mockProductService = {
      getProductById: jest.fn(),
    };

    const module: TestingModule = await createTestModuleBuilder()
      .withProvider(CreateOrderHandler)
      .withMockProvider('IOrderRepository', mockOrderRepository)
      .withMockProvider('IProductService', mockProductService)
      .build();

    handler = module.get<CreateOrderHandler>(CreateOrderHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should create an order successfully', async () => {
      // Arrange
      const command = new CreateOrderCommand('John Doe', 'test-product-id', 5);

      const mockProduct = ProductFactory.createProductDto({
        id: 'test-product-id',
        name: 'Test Product',
        price: 100,
        stock: 10,
      });

      const mockOrder = OrderFactory.createOrder({
        customerName: command.customerName,
        totalAmount: mockProduct.price * command.quantity,
      });

      mockProductService.getProductById.mockResolvedValue(mockProduct);
      mockOrderRepository.create.mockResolvedValue(mockOrder);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(mockProductService.getProductById).toHaveBeenCalledWith(command.productId);
      expect(mockOrderRepository.create).toHaveBeenCalledWith({
        customerName: command.customerName,
        totalAmount: 500,
        status: 'pending',
        items: expect.any(String),
      });
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

    it('should throw NotFoundException when product does not exist', async () => {
      // Arrange
      const command = new CreateOrderCommand('John Doe', 'non-existent-product-id', 5);

      mockProductService.getProductById.mockResolvedValue(null as any);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
      expect(mockProductService.getProductById).toHaveBeenCalledWith(command.productId);
      expect(mockOrderRepository.create).not.toHaveBeenCalled();
    });

    it('should calculate total amount correctly', async () => {
      // Arrange
      const command = new CreateOrderCommand('Jane Doe', 'test-product-id', 3);

      const mockProduct = ProductFactory.createProductDto({
        id: 'test-product-id',
        price: 50,
      });

      const mockOrder = OrderFactory.createOrder({
        customerName: command.customerName,
        totalAmount: 150,
      });

      mockProductService.getProductById.mockResolvedValue(mockProduct);
      mockOrderRepository.create.mockResolvedValue(mockOrder);

      // Act
      await handler.execute(command);

      // Assert
      expect(mockOrderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          totalAmount: 150, // 50 * 3
        }),
      );
    });

    it('should throw error when order validation fails', async () => {
      // Arrange
      const command = new CreateOrderCommand(
        '', // Invalid: empty customer name
        'test-product-id',
        5,
      );

      const mockProduct = ProductFactory.createProductDto({
        id: 'test-product-id',
        price: 100,
      });

      mockProductService.getProductById.mockResolvedValue(mockProduct);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow();
      expect(mockOrderRepository.create).not.toHaveBeenCalled();
    });
  });
});
