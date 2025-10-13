import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { IProductRepository } from '../interfaces';
import { ProductResponseDto } from '../dtos';
import { ProductMapper } from '../mappers';

export class DeleteProductCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteProductCommand)
export class DeleteProductHandler
  implements ICommandHandler<DeleteProductCommand, ProductResponseDto>
{
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: DeleteProductCommand): Promise<ProductResponseDto> {
    const product = await this.productRepository.delete(command.id);
    return ProductMapper.toDto(product);
  }
}
