import { Order } from '../entities/order.entity';
import { OrderResponseDto } from '../dtos/order-response.dto';

export class OrderMapper {
  static toDto(order: Order): OrderResponseDto {
    return {
      id: order.id,
      customerName: order.customerName,
      totalAmount: order.totalAmount,
      status: order.status,
      items: JSON.parse(order.items),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  static toDtoArray(orders: Order[]): OrderResponseDto[] {
    return orders.map((order) => this.toDto(order));
  }
}
