import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ProductController } from './product.controller';
import { ProductRepository } from './infrastructure';
import { ProductService } from './product.service';
import { PrismaService } from '../../prisma/prisma.service';

// Command Handlers
import {
  CreateProductHandler,
  UpdateProductHandler,
  DeleteProductHandler,
} from './commands';

// Query Handlers
import { GetProductHandler, ListProductsHandler } from './queries';

const CommandHandlers = [
  CreateProductHandler,
  UpdateProductHandler,
  DeleteProductHandler,
];

const QueryHandlers = [GetProductHandler, ListProductsHandler];

@Module({
  imports: [CqrsModule],
  controllers: [ProductController],
  providers: [
    {
      provide: 'IProductRepository',
      useClass: ProductRepository,
    },
    {
      provide: 'IProductService',
      useClass: ProductService,
    },
    PrismaService,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: ['IProductRepository', 'IProductService'],
})
export class ProductModule {}
