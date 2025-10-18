import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import type { IOrderRepository } from '../interfaces';
import { OrderResponseDto } from '../dtos';
import { OrderMapper } from '../mappers';
import { Order } from '../entities';
import type { IProductService, ProductDto } from '../../../shared';

export class CreateOrderCommand {
  constructor(
    public readonly customerName: string,
    public readonly productId: string,
    public readonly quantity: number,
  ) {}
}

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler
  implements ICommandHandler<CreateOrderCommand, OrderResponseDto>
{
  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
    @Inject('IProductService')
    private readonly productService: IProductService,
  ) {}

  async execute(command: CreateOrderCommand): Promise<OrderResponseDto> {
    const { customerName, productId, quantity } = command;

    // Get product info using shared interface
    const product: ProductDto =
      await this.productService.getProductById(productId);

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Calculate total amount
    const totalAmount = product.price * quantity;

    // Build order items
    const items = JSON.stringify([
      {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity,
      },
    ]);

    // Use domain factory method for validation (status defaults to 'pending')
    Order.create({ customerName, totalAmount });

    const order = await this.orderRepository.create({
      customerName,
      totalAmount,
      status: 'pending',
      items,
    });

    return OrderMapper.toDto(order);
  }
}
