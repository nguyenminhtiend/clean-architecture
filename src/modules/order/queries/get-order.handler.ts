import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { IOrderRepository } from '../interfaces';
import { OrderResponseDto } from '../dtos';
import { OrderMapper } from '../mappers';

export class GetOrderQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(GetOrderQuery)
export class GetOrderHandler implements IQueryHandler<GetOrderQuery, OrderResponseDto> {
  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(query: GetOrderQuery): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findById(query.id);
    return OrderMapper.toDto(order);
  }
}
