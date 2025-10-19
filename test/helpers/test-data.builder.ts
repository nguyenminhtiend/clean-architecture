/**
 * Builders for creating test data with fluent API
 */

export class ProductDataBuilder {
  private data: any = {
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    stock: 10,
  };

  withName(name: string): this {
    this.data.name = name;
    return this;
  }

  withDescription(description: string | null): this {
    this.data.description = description;
    return this;
  }

  withPrice(price: number): this {
    this.data.price = price;
    return this;
  }

  withStock(stock: number): this {
    this.data.stock = stock;
    return this;
  }

  build(): any {
    return { ...this.data };
  }
}

export class OrderDataBuilder {
  private data: any = {
    customerName: 'John Doe',
    productId: 'test-product-id',
    quantity: 1,
  };

  withCustomerName(customerName: string): this {
    this.data.customerName = customerName;
    return this;
  }

  withProductId(productId: string): this {
    this.data.productId = productId;
    return this;
  }

  withQuantity(quantity: number): this {
    this.data.quantity = quantity;
    return this;
  }

  build(): any {
    return { ...this.data };
  }
}

export function createProductData(overrides?: any): any {
  return new ProductDataBuilder().build();
}

export function createOrderData(overrides?: any): any {
  return new OrderDataBuilder().build();
}
