import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { IProductRepository } from '../interfaces';
import { ProductResponseDto } from '../dtos';
import { ProductMapper } from '../mappers';

export class GetProductQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(GetProductQuery)
export class GetProductHandler
  implements IQueryHandler<GetProductQuery, ProductResponseDto>
{
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(query: GetProductQuery): Promise<ProductResponseDto> {
    const product = await this.productRepository.findById(query.id);
    return ProductMapper.toDto(product);
  }
}
