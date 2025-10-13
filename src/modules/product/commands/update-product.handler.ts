import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { IProductRepository } from '../interfaces';
import { ProductResponseDto } from '../dtos';
import { ProductMapper } from '../mappers';

export class UpdateProductCommand {
  constructor(
    public readonly id: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly price?: number,
    public readonly stock?: number,
  ) {}
}

@CommandHandler(UpdateProductCommand)
export class UpdateProductHandler
  implements ICommandHandler<UpdateProductCommand, ProductResponseDto>
{
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: UpdateProductCommand): Promise<ProductResponseDto> {
    const { id, name, description, price, stock } = command;

    const updateData: {
      name?: string;
      description?: string | null;
      price?: number;
      stock?: number;
    } = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;

    const product = await this.productRepository.update(id, updateData);
    return ProductMapper.toDto(product);
  }
}
