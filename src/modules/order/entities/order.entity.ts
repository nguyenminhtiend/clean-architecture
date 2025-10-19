export class Order {
  private constructor(
    public readonly id: string,
    public readonly customerName: string,
    public readonly totalAmount: number,
    public readonly status: string,
    public readonly items: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    this.validateCustomerName(customerName);
    this.validateTotalAmount(totalAmount);
    this.validateStatus(status);
  }

  static create(data: {
    customerName: string;
    totalAmount: number;
    status?: string;
    items?: string;
  }): {
    customerName: string;
    totalAmount: number;
    status: string;
    items: string;
  } {
    const order = {
      customerName: data.customerName,
      totalAmount: data.totalAmount,
      status: data.status ?? 'pending',
      items: data.items ?? '[]',
    };

    // Validate
    Order.prototype.validateCustomerName(data.customerName);
    Order.prototype.validateTotalAmount(data.totalAmount);
    Order.prototype.validateStatus(order.status);

    return order;
  }

  static reconstitute(data: {
    id: string;
    customerName: string;
    totalAmount: number;
    status: string;
    items: string;
    createdAt: Date;
    updatedAt: Date;
  }): Order {
    return new Order(
      data.id,
      data.customerName,
      data.totalAmount,
      data.status,
      data.items,
      data.createdAt,
      data.updatedAt,
    );
  }

  updateStatus(status: string): Order {
    this.validateStatus(status);
    return Order.reconstitute({
      ...this,
      status,
      updatedAt: new Date(),
    });
  }

  private validateCustomerName(customerName: string): void {
    if (!customerName || customerName.trim().length === 0) {
      throw new Error('Customer name cannot be empty');
    }
    if (customerName.length > 255) {
      throw new Error('Customer name cannot exceed 255 characters');
    }
  }

  private validateTotalAmount(totalAmount: number): void {
    if (totalAmount < 0) {
      throw new Error('Order total amount cannot be negative');
    }
    if (!Number.isFinite(totalAmount)) {
      throw new Error('Order total amount must be a valid number');
    }
  }

  private validateStatus(status: string): void {
    const validStatuses = ['pending', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Order status must be one of: ${validStatuses.join(', ')}`);
    }
  }
}
