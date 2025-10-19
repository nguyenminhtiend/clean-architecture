import { TestingModule } from '@nestjs/testing';
import {
  ListProductsHandler,
  ListProductsQuery,
} from '../../../../../src/modules/product/queries/list-products.handler';
import { IProductRepository } from '../../../../../src/modules/product/interfaces';
import { ProductFactory, createMockRepository, createTestModuleBuilder } from '../../../../helpers';

describe('ListProductsHandler', () => {
  let handler: ListProductsHandler;
  let mockRepository: jest.Mocked<IProductRepository>;

  beforeEach(async () => {
    mockRepository = createMockRepository() as jest.Mocked<IProductRepository>;

    const module: TestingModule = await createTestModuleBuilder()
      .withProvider(ListProductsHandler)
      .withMockProvider('IProductRepository', mockRepository)
      .build();

    handler = module.get<ListProductsHandler>(ListProductsHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should list all products without pagination', async () => {
      // Arrange
      const query = new ListProductsQuery();

      const mockProducts = [
        ProductFactory.createProduct({ id: '1', name: 'Product 1' }),
        ProductFactory.createProduct({ id: '2', name: 'Product 2' }),
        ProductFactory.createProduct({ id: '3', name: 'Product 3' }),
      ];

      mockRepository.findAll.mockResolvedValue(mockProducts);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(mockRepository.findAll).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
      });
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Product 1');
      expect(result[1].name).toBe('Product 2');
      expect(result[2].name).toBe('Product 3');
    });

    it('should list products with pagination', async () => {
      // Arrange
      const query = new ListProductsQuery(10, 5);

      const mockProducts = [
        ProductFactory.createProduct({ id: '11', name: 'Product 11' }),
        ProductFactory.createProduct({ id: '12', name: 'Product 12' }),
      ];

      mockRepository.findAll.mockResolvedValue(mockProducts);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(mockRepository.findAll).toHaveBeenCalledWith({
        skip: 10,
        take: 5,
      });
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no products found', async () => {
      // Arrange
      const query = new ListProductsQuery();

      mockRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should list products with only skip parameter', async () => {
      // Arrange
      const query = new ListProductsQuery(20);

      const mockProducts = [ProductFactory.createProduct({ id: '21', name: 'Product 21' })];

      mockRepository.findAll.mockResolvedValue(mockProducts);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(mockRepository.findAll).toHaveBeenCalledWith({
        skip: 20,
        take: undefined,
      });
      expect(result).toHaveLength(1);
    });

    it('should list products with only take parameter', async () => {
      // Arrange
      const query = new ListProductsQuery(undefined, 10);

      const mockProducts = Array.from({ length: 10 }, (_, i) =>
        ProductFactory.createProduct({
          id: `${i + 1}`,
          name: `Product ${i + 1}`,
        }),
      );

      mockRepository.findAll.mockResolvedValue(mockProducts);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(mockRepository.findAll).toHaveBeenCalledWith({
        skip: undefined,
        take: 10,
      });
      expect(result).toHaveLength(10);
    });

    it('should return products with all fields mapped correctly', async () => {
      // Arrange
      const query = new ListProductsQuery();

      const mockProducts = [
        ProductFactory.createProduct({
          id: 'product-1',
          name: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          stock: 50,
        }),
      ];

      mockRepository.findAll.mockResolvedValue(mockProducts);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result[0]).toEqual({
        id: 'product-1',
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        stock: 50,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });
});
