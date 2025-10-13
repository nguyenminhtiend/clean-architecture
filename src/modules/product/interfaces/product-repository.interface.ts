import { Product } from '../entities/product.entity';

export interface IProductRepository {
  create(data: {
    name: string;
    description?: string | null;
    price: number;
    stock?: number;
  }): Promise<Product>;
  findById(id: string): Promise<Product>;
  findAll(params?: { skip?: number; take?: number }): Promise<Product[]>;
  update(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      price?: number;
      stock?: number;
    },
  ): Promise<Product>;
  delete(id: string): Promise<Product>;
}
