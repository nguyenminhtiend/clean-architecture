import { TestingModule } from '@nestjs/testing';
import {
  GetProductHandler,
  GetProductQuery,
} from '../../../../../src/modules/product/queries/get-product.handler';
import { IProductRepository } from '../../../../../src/modules/product/interfaces';
import { ProductFactory, createMockRepository, createTestModuleBuilder } from '../../../../helpers';

describe('GetProductHandler', () => {
  let handler: GetProductHandler;
  let mockRepository: jest.Mocked<IProductRepository>;

  beforeEach(async () => {
    mockRepository = createMockRepository() as jest.Mocked<IProductRepository>;

    const module: TestingModule = await createTestModuleBuilder()
      .withProvider(GetProductHandler)
      .withMockProvider('IProductRepository', mockRepository)
      .build();

    handler = module.get<GetProductHandler>(GetProductHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return a product successfully', async () => {
      // Arrange
      const productId = 'test-product-id';
      const query = new GetProductQuery(productId);

      const mockProduct = ProductFactory.createProduct({ id: productId });

      mockRepository.findById.mockResolvedValue(mockProduct);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(productId);
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

    it('should throw error when product not found', async () => {
      // Arrange
      const productId = 'non-existent-id';
      const query = new GetProductQuery(productId);

      mockRepository.findById.mockRejectedValue(new Error('Product not found'));

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow('Product not found');
      expect(mockRepository.findById).toHaveBeenCalledWith(productId);
    });
  });
});
