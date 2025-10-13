export class Product {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly price: number,
    public readonly stock: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    this.validatePrice(price);
    this.validateStock(stock);
    this.validateName(name);
  }

  static create(data: {
    name: string;
    description?: string | null;
    price: number;
    stock?: number;
  }): {
    name: string;
    description: string | null;
    price: number;
    stock: number;
  } {
    const product = {
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      stock: data.stock ?? 0,
    };

    // Validate
    Product.prototype.validateName(data.name);
    Product.prototype.validatePrice(data.price);
    Product.prototype.validateStock(product.stock);

    return product;
  }

  static reconstitute(data: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    createdAt: Date;
    updatedAt: Date;
  }): Product {
    return new Product(
      data.id,
      data.name,
      data.description,
      data.price,
      data.stock,
      data.createdAt,
      data.updatedAt,
    );
  }

  updateStock(quantity: number): Product {
    const newStock = this.stock + quantity;
    this.validateStock(newStock);
    return Product.reconstitute({
      ...this,
      stock: newStock,
      updatedAt: new Date(),
    });
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Product name cannot be empty');
    }
    if (name.length > 255) {
      throw new Error('Product name cannot exceed 255 characters');
    }
  }

  private validatePrice(price: number): void {
    if (price < 0) {
      throw new Error('Product price cannot be negative');
    }
    if (!Number.isFinite(price)) {
      throw new Error('Product price must be a valid number');
    }
  }

  private validateStock(stock: number): void {
    if (stock < 0) {
      throw new Error('Product stock cannot be negative');
    }
    if (!Number.isInteger(stock)) {
      throw new Error('Product stock must be an integer');
    }
  }
}
