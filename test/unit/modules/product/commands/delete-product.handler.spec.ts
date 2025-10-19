import { Test, TestingModule } from '@nestjs/testing';
import {
  DeleteProductHandler,
  DeleteProductCommand,
} from '../../../../../src/modules/product/commands/delete-product.handler';
import { IProductRepository } from '../../../../../src/modules/product/interfaces';
import {
  ProductFactory,
  createMockRepository,
  createTestModuleBuilder,
} from '../../../../helpers';

describe('DeleteProductHandler', () => {
  let handler: DeleteProductHandler;
  let mockRepository: jest.Mocked<IProductRepository>;

  beforeEach(async () => {
    mockRepository = createMockRepository() as jest.Mocked<IProductRepository>;

    const module: TestingModule = await createTestModuleBuilder()
      .withProvider(DeleteProductHandler)
      .withMockProvider('IProductRepository', mockRepository)
      .build();

    handler = module.get<DeleteProductHandler>(DeleteProductHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should delete a product successfully', async () => {
      // Arrange
      const command = new DeleteProductCommand('test-id');

      const mockProduct = ProductFactory.createProduct({
        id: 'test-id',
        name: 'Product to Delete',
      });

      mockRepository.delete.mockResolvedValue(mockProduct);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(mockRepository.delete).toHaveBeenCalledWith('test-id');
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

    it('should throw when product not found', async () => {
      // Arrange
      const command = new DeleteProductCommand('non-existent-id');

      mockRepository.delete.mockRejectedValue(new Error('Product not found'));

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'Product not found',
      );
      expect(mockRepository.delete).toHaveBeenCalledWith('non-existent-id');
    });

    it('should return deleted product data', async () => {
      // Arrange
      const command = new DeleteProductCommand('deleted-id');

      const mockProduct = ProductFactory.createProduct({
        id: 'deleted-id',
        name: 'Deleted Product',
        description: 'This was deleted',
        price: 99.99,
        stock: 0,
      });

      mockRepository.delete.mockResolvedValue(mockProduct);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result.id).toBe('deleted-id');
      expect(result.name).toBe('Deleted Product');
      expect(result.description).toBe('This was deleted');
      expect(result.price).toBe(99.99);
      expect(result.stock).toBe(0);
    });
  });
});
