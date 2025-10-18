import { Order } from '../entities/order.entity';

export interface IOrderRepository {
  create(data: {
    customerName: string;
    totalAmount: number;
    status?: string;
    items?: string;
  }): Promise<Order>;
  findById(id: string): Promise<Order>;
  findAll(params?: { skip?: number; take?: number }): Promise<Order[]>;
  update(
    id: string,
    data: {
      customerName?: string;
      totalAmount?: number;
      status?: string;
      items?: string;
    },
  ): Promise<Order>;
  delete(id: string): Promise<Order>;
}
