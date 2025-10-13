import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { IProductRepository } from '../interfaces';
import { ProductResponseDto } from '../dtos';
import { ProductMapper } from '../mappers';
import { Product } from '../entities';

export class CreateProductCommand {
  constructor(
    public readonly name: string,
    public readonly description: string | undefined,
    public readonly price: number,
    public readonly stock: number,
  ) {}
}

@CommandHandler(CreateProductCommand)
export class CreateProductHandler
  implements ICommandHandler<CreateProductCommand, ProductResponseDto>
{
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: CreateProductCommand): Promise<ProductResponseDto> {
    const { name, description, price, stock } = command;

    // Use domain factory method for validation
    Product.create({ name, description, price, stock });

    const product = await this.productRepository.create({
      name,
      description,
      price,
      stock,
    });

    return ProductMapper.toDto(product);
  }
}
