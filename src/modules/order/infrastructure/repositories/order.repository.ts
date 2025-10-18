import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { EntityNotFoundException } from '../../../../shared/exceptions/entity-not-found.exception';
import { IOrderRepository } from '../../interfaces/order-repository.interface';
import { Order } from '../../entities/order.entity';

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    customerName: string;
    totalAmount: number;
    status?: string;
    items?: string;
  }): Promise<Order> {
    const prismaOrder = await this.prisma.order.create({
      data: {
        customerName: data.customerName,
        totalAmount: data.totalAmount,
        status: data.status ?? 'pending',
        items: data.items ?? '[]',
      },
    });

    return Order.reconstitute(prismaOrder);
  }

  async findById(id: string): Promise<Order> {
    const prismaOrder = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!prismaOrder) {
      throw new EntityNotFoundException('Order', id);
    }

    return Order.reconstitute(prismaOrder);
  }

  async findAll(params?: { skip?: number; take?: number }): Promise<Order[]> {
    const { skip, take } = params || {};

    const prismaOrders = await this.prisma.order.findMany({
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return prismaOrders.map((o) => Order.reconstitute(o));
  }

  async update(
    id: string,
    data: {
      customerName?: string;
      totalAmount?: number;
      status?: string;
      items?: string;
    },
  ): Promise<Order> {
    // Check if exists
    await this.findById(id);

    const prismaOrder = await this.prisma.order.update({
      where: { id },
      data,
    });

    return Order.reconstitute(prismaOrder);
  }

  async delete(id: string): Promise<Order> {
    // Check if exists
    await this.findById(id);

    const prismaOrder = await this.prisma.order.delete({
      where: { id },
    });

    return Order.reconstitute(prismaOrder);
  }
}
