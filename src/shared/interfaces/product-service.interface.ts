import type { ProductDto } from '../dtos';

export interface IProductService {
  getProductById(id: string): Promise<ProductDto>;
}
