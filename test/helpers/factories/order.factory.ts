import { Order } from '../../../src/modules/order/entities';
import type { OrderResponseDto } from '../../../src/modules/order/dtos';

export class OrderFactory {
  static createOrder(overrides?: Partial<Order>): Order {
    return Order.reconstitute({
      id: 'test-order-id',
      customerName: 'John Doe',
      totalAmount: 1000,
      status: 'pending',
      items: JSON.stringify([
        {
          productId: 'test-product-id',
          productName: 'Test Product',
          price: 100,
          quantity: 10,
        },
      ]),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      ...overrides,
    });
  }

  static createOrderDto(overrides?: Partial<OrderResponseDto>): OrderResponseDto {
    return {
      id: 'test-order-id',
      customerName: 'John Doe',
      totalAmount: 1000,
      status: 'pending',
      items: [
        {
          productId: 'test-product-id',
          productName: 'Test Product',
          price: 100,
          quantity: 10,
        },
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      ...overrides,
    };
  }

  static createPrismaOrder(overrides?: any): any {
    return {
      id: 'test-order-id',
      customerName: 'John Doe',
      totalAmount: 1000,
      status: 'pending',
      items: JSON.stringify([
        {
          productId: 'test-product-id',
          productName: 'Test Product',
          price: 100,
          quantity: 10,
        },
      ]),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      ...overrides,
    };
  }
}
