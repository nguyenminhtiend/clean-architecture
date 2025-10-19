import { TestingModule } from '@nestjs/testing';
import {
  CreateProductHandler,
  CreateProductCommand,
} from '../../../../../src/modules/product/commands/create-product.handler';
import { IProductRepository } from '../../../../../src/modules/product/interfaces';
import { ProductFactory, createMockRepository, createTestModuleBuilder } from '../../../../helpers';

describe('CreateProductHandler', () => {
  let handler: CreateProductHandler;
  let mockRepository: jest.Mocked<IProductRepository>;

  beforeEach(async () => {
    mockRepository = createMockRepository() as jest.Mocked<IProductRepository>;

    const module: TestingModule = await createTestModuleBuilder()
      .withProvider(CreateProductHandler)
      .withMockProvider('IProductRepository', mockRepository)
      .build();

    handler = module.get<CreateProductHandler>(CreateProductHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should create a product successfully', async () => {
      // Arrange
      const command = new CreateProductCommand('Test Product', 'Test Description', 100, 10);

      const mockProduct = ProductFactory.createProduct({
        name: command.name,
        description: command.description,
        price: command.price,
        stock: command.stock,
      });

      mockRepository.create.mockResolvedValue(mockProduct);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith({
        name: command.name,
        description: command.description,
        price: command.price,
        stock: command.stock,
      });
      expect(result).toEqual({
        id: mockProduct.id,
        name: mockProduct.name,
        description: mockProduct.description,
        price: mockProduct.price,
        stock: mockProduct.stock,
        createdAt: mockProduct.createdAt,
        updatedAt: mockProduct.updatedAt,
      });
    });

    it('should throw error when product validation fails', async () => {
      // Arrange
      const command = new CreateProductCommand(
        '', // Invalid: empty name
        'Test Description',
        100,
        10,
      );

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when price is negative', async () => {
      // Arrange
      const command = new CreateProductCommand(
        'Test Product',
        'Test Description',
        -100, // Invalid: negative price
        10,
      );

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should create product with minimal data', async () => {
      // Arrange
      const command = new CreateProductCommand(
        'Test Product',
        undefined, // Optional description
        100,
        0,
      );

      const mockProduct = ProductFactory.createProduct({
        name: command.name,
        description: null,
        price: command.price,
        stock: command.stock,
      });

      mockRepository.create.mockResolvedValue(mockProduct);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith({
        name: command.name,
        description: undefined,
        price: command.price,
        stock: command.stock,
      });
      expect(result).toBeDefined();
    });
  });
});
