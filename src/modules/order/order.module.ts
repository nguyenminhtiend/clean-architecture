import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { OrderController } from './order.controller';
import { OrderRepository } from './infrastructure';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductModule } from '../product/product.module';

// Command Handlers
import { CreateOrderHandler } from './commands';

// Query Handlers
import { GetOrderHandler, ListOrdersHandler } from './queries';

const CommandHandlers = [CreateOrderHandler];

const QueryHandlers = [GetOrderHandler, ListOrdersHandler];

@Module({
  imports: [CqrsModule, ProductModule],
  controllers: [OrderController],
  providers: [
    {
      provide: 'IOrderRepository',
      useClass: OrderRepository,
    },
    PrismaService,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: ['IOrderRepository'],
})
export class OrderModule {}
