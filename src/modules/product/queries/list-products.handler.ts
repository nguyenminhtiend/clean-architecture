import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { IProductRepository } from '../interfaces';
import { ProductResponseDto } from '../dtos';
import { ProductMapper } from '../mappers';

export class ListProductsQuery {
  constructor(
    public readonly skip?: number,
    public readonly take?: number,
  ) {}
}

@QueryHandler(ListProductsQuery)
export class ListProductsHandler
  implements IQueryHandler<ListProductsQuery, ProductResponseDto[]>
{
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(query: ListProductsQuery): Promise<ProductResponseDto[]> {
    const products = await this.productRepository.findAll({
      skip: query.skip,
      take: query.take,
    });

    return ProductMapper.toDtoArray(products);
  }
}
