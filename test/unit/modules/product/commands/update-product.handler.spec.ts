import { Test, TestingModule } from '@nestjs/testing';
import {
  UpdateProductHandler,
  UpdateProductCommand,
} from '../../../../../src/modules/product/commands/update-product.handler';
import { IProductRepository } from '../../../../../src/modules/product/interfaces';
import {
  ProductFactory,
  createMockRepository,
  createTestModuleBuilder,
} from '../../../../helpers';

describe('UpdateProductHandler', () => {
  let handler: UpdateProductHandler;
  let mockRepository: jest.Mocked<IProductRepository>;

  beforeEach(async () => {
    mockRepository = createMockRepository() as jest.Mocked<IProductRepository>;

    const module: TestingModule = await createTestModuleBuilder()
      .withProvider(UpdateProductHandler)
      .withMockProvider('IProductRepository', mockRepository)
      .build();

    handler = module.get<UpdateProductHandler>(UpdateProductHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should update all product fields', async () => {
      // Arrange
      const command = new UpdateProductCommand(
        'test-id',
        'Updated Name',
        'Updated Description',
        200,
        100,
      );

      const mockProduct = ProductFactory.createProduct({
        id: 'test-id',
        name: 'Updated Name',
        description: 'Updated Description',
        price: 200,
        stock: 100,
      });

      mockRepository.update.mockResolvedValue(mockProduct);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(mockRepository.update).toHaveBeenCalledWith('test-id', {
        name: 'Updated Name',
        description: 'Updated Description',
        price: 200,
        stock: 100,
      });
      expect(result).toEqual({
        id: mockProduct.id,
        name: 'Updated Name',
        description: 'Updated Description',
        price: 200,
        stock: 100,
        createdAt: mockProduct.createdAt,
        updatedAt: mockProduct.updatedAt,
      });
    });

    it('should update only name field', async () => {
      // Arrange
      const command = new UpdateProductCommand(
        'test-id',
        'New Name Only',
        undefined,
        undefined,
        undefined,
      );

      const mockProduct = ProductFactory.createProduct({
        id: 'test-id',
        name: 'New Name Only',
        description: 'Old Description',
        price: 100,
        stock: 50,
      });

      mockRepository.update.mockResolvedValue(mockProduct);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(mockRepository.update).toHaveBeenCalledWith('test-id', {
        name: 'New Name Only',
      });
      expect(result.name).toBe('New Name Only');
    });

    it('should update only price field', async () => {
      // Arrange
      const command = new UpdateProductCommand(
        'test-id',
        undefined,
        undefined,
        299.99,
        undefined,
      );

      const mockProduct = ProductFactory.createProduct({
        id: 'test-id',
        price: 299.99,
      });

      mockRepository.update.mockResolvedValue(mockProduct);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(mockRepository.update).toHaveBeenCalledWith('test-id', {
        price: 299.99,
      });
      expect(result.price).toBe(299.99);
    });

    it('should update only stock field', async () => {
      // Arrange
      const command = new UpdateProductCommand(
        'test-id',
        undefined,
        undefined,
        undefined,
        500,
      );

      const mockProduct = ProductFactory.createProduct({
        id: 'test-id',
        stock: 500,
      });

      mockRepository.update.mockResolvedValue(mockProduct);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(mockRepository.update).toHaveBeenCalledWith('test-id', {
        stock: 500,
      });
      expect(result.stock).toBe(500);
    });

    it('should update description to null', async () => {
      // Arrange
      const command = new UpdateProductCommand(
        'test-id',
        undefined,
        '',
        undefined,
        undefined,
      );

      const mockProduct = ProductFactory.createProduct({
        id: 'test-id',
        description: null,
      });

      mockRepository.update.mockResolvedValue(mockProduct);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(mockRepository.update).toHaveBeenCalledWith('test-id', {
        description: '',
      });
      expect(result).toBeDefined();
    });

    it('should update multiple fields but not all', async () => {
      // Arrange
      const command = new UpdateProductCommand(
        'test-id',
        'Updated Name',
        undefined,
        250,
        undefined,
      );

      const mockProduct = ProductFactory.createProduct({
        id: 'test-id',
        name: 'Updated Name',
        price: 250,
      });

      mockRepository.update.mockResolvedValue(mockProduct);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(mockRepository.update).toHaveBeenCalledWith('test-id', {
        name: 'Updated Name',
        price: 250,
      });
      expect(result.name).toBe('Updated Name');
      expect(result.price).toBe(250);
    });

    it('should throw when product not found', async () => {
      // Arrange
      const command = new UpdateProductCommand('non-existent-id', 'New Name');

      mockRepository.update.mockRejectedValue(new Error('Product not found'));

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'Product not found',
      );
    });
  });
});
