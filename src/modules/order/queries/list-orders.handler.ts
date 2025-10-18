import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { IOrderRepository } from '../interfaces';
import { OrderResponseDto } from '../dtos';
import { OrderMapper } from '../mappers';

export class ListOrdersQuery {
  constructor(
    public readonly skip?: number,
    public readonly take?: number,
  ) {}
}

@QueryHandler(ListOrdersQuery)
export class ListOrdersHandler
  implements IQueryHandler<ListOrdersQuery, OrderResponseDto[]>
{
  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(query: ListOrdersQuery): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.findAll({
      skip: query.skip,
      take: query.take,
    });

    return OrderMapper.toDtoArray(orders);
  }
}
