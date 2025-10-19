import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import type { IProductService, ProductDto } from '../../shared';
import { GetProductQuery } from './queries';
import type { ProductResponseDto } from './dtos';

@Injectable()
export class ProductService implements IProductService {
  constructor(private readonly queryBus: QueryBus) {}

  async getProductById(id: string): Promise<ProductDto> {
    const product: ProductResponseDto = await this.queryBus.execute(new GetProductQuery(id));

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
