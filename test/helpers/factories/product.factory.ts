import { Product } from '../../../src/modules/product/entities';
import type { ProductResponseDto } from '../../../src/modules/product/dtos';

export class ProductFactory {
  static createProduct(overrides?: Partial<Product>): Product {
    return Product.reconstitute({
      id: 'test-product-id',
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      stock: 10,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      ...overrides,
    });
  }

  static createProductDto(overrides?: Partial<ProductResponseDto>): ProductResponseDto {
    return {
      id: 'test-product-id',
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      stock: 10,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      ...overrides,
    };
  }

  static createPrismaProduct(overrides?: any): any {
    return {
      id: 'test-product-id',
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      stock: 10,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      ...overrides,
    };
  }
}
