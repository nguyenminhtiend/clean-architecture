import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { EntityNotFoundException } from '../../../../shared/exceptions/entity-not-found.exception';
import { IProductRepository } from '../../interfaces/product-repository.interface';
import { Product } from '../../entities/product.entity';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    description?: string | null;
    price: number;
    stock?: number;
  }): Promise<Product> {
    const prismaProduct = await this.prisma.product.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        price: data.price,
        stock: data.stock ?? 0,
      },
    });

    return Product.reconstitute(prismaProduct);
  }

  async findById(id: string): Promise<Product> {
    const prismaProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!prismaProduct) {
      throw new EntityNotFoundException('Product', id);
    }

    return Product.reconstitute(prismaProduct);
  }

  async findAll(params?: { skip?: number; take?: number }): Promise<Product[]> {
    const { skip, take } = params || {};

    const prismaProducts = await this.prisma.product.findMany({
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return prismaProducts.map((p) => Product.reconstitute(p));
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      price?: number;
      stock?: number;
    },
  ): Promise<Product> {
    // Check if exists
    await this.findById(id);

    const prismaProduct = await this.prisma.product.update({
      where: { id },
      data,
    });

    return Product.reconstitute(prismaProduct);
  }

  async delete(id: string): Promise<Product> {
    // Check if exists
    await this.findById(id);

    const prismaProduct = await this.prisma.product.delete({
      where: { id },
    });

    return Product.reconstitute(prismaProduct);
  }
}
