import { Test, TestingModule } from '@nestjs/testing';
import { QueryBus } from '@nestjs/cqrs';
import { ProductService } from '../../../../src/modules/product/product.service';
import { GetProductQuery } from '../../../../src/modules/product/queries';
import { ProductFactory } from '../../../helpers';

describe('ProductService', () => {
  let service: ProductService;
  let queryBus: jest.Mocked<QueryBus>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    queryBus = module.get(QueryBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProductById', () => {
    it('should get product by id and return ProductDto', async () => {
      // Arrange
      const productId = 'test-product-id';
      const mockProduct = ProductFactory.createProduct({
        id: productId,
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        stock: 50,
      });

      queryBus.execute.mockResolvedValue({
        id: mockProduct.id,
        name: mockProduct.name,
        description: mockProduct.description,
        price: mockProduct.price,
        stock: mockProduct.stock,
        createdAt: mockProduct.createdAt,
        updatedAt: mockProduct.updatedAt,
      });

      // Act
      const result = await service.getProductById(productId);

      // Assert
      expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetProductQuery));
      const executedQuery = queryBus.execute.mock.calls[0][0] as GetProductQuery;
      expect(executedQuery.id).toBe(productId);
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

    it('should handle products with null description', async () => {
      // Arrange
      const productId = 'test-product-id';
      const mockProduct = ProductFactory.createProduct({
        id: productId,
        name: 'Test Product',
        description: null,
        price: 99.99,
        stock: 50,
      });

      queryBus.execute.mockResolvedValue({
        id: mockProduct.id,
        name: mockProduct.name,
        description: null,
        price: mockProduct.price,
        stock: mockProduct.stock,
        createdAt: mockProduct.createdAt,
        updatedAt: mockProduct.updatedAt,
      });

      // Act
      const result = await service.getProductById(productId);

      // Assert
      expect(result.description).toBeNull();
    });
  });
});
