import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateOrderCommand } from './update-order.command';
import type { IOrderRepository } from '../interfaces';
import { OrderResponseDto } from '../dtos';
import { OrderMapper } from '../mappers';

@CommandHandler(UpdateOrderCommand)
export class UpdateOrderHandler
  implements ICommandHandler<UpdateOrderCommand, OrderResponseDto>
{
  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(command: UpdateOrderCommand): Promise<OrderResponseDto> {
    const { id, status } = command;

    // Check if order exists
    const existingOrder = await this.orderRepository.findById(id);
    if (!existingOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Update the order
    const updatedOrder = await this.orderRepository.update(id, { status });

    return OrderMapper.toDto(updatedOrder);
  }
}
