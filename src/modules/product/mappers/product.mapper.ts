import { Product } from '../entities/product.entity';
import { ProductResponseDto } from '../dtos/product-response.dto';

export class ProductMapper {
  static toDto(product: Product): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  static toDtoArray(products: Product[]): ProductResponseDto[] {
    return products.map((product) => this.toDto(product));
  }
}
