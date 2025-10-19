import { Test, TestingModule } from '@nestjs/testing';
import { OrderModule } from '../../../../../src/modules/order/order.module';
import { PrismaService } from '../../../../../src/prisma/prisma.service';
import {
  CreateOrderHandler,
  UpdateOrderHandler,
} from '../../../../../src/modules/order/commands';
import {
  GetOrderHandler,
  ListOrdersHandler,
} from '../../../../../src/modules/order/queries';
import {
  CreateOrderCommand,
  UpdateOrderCommand,
} from '../../../../../src/modules/order/commands';
import {
  GetOrderQuery,
  ListOrdersQuery,
} from '../../../../../src/modules/order/queries';
import { clearDatabase } from '../../../../helpers/test-db-setup';

describe('Order Handlers Integration (Real DB)', () => {
  let moduleRef: TestingModule;
  let prismaService: PrismaService;
  let createHandler: CreateOrderHandler;
  let updateHandler: UpdateOrderHandler;
  let getHandler: GetOrderHandler;
  let listHandler: ListOrdersHandler;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [OrderModule], // OrderModule already imports ProductModule
    }).compile();

    await moduleRef.init();

    prismaService = moduleRef.get<PrismaService>(PrismaService);
    createHandler = moduleRef.get<CreateOrderHandler>(CreateOrderHandler);
    updateHandler = moduleRef.get<UpdateOrderHandler>(UpdateOrderHandler);
    getHandler = moduleRef.get<GetOrderHandler>(GetOrderHandler);
    listHandler = moduleRef.get<ListOrdersHandler>(ListOrdersHandler);
  });

  beforeEach(async () => {
    await clearDatabase(prismaService);
  });

  afterAll(async () => {
    await clearDatabase(prismaService);
    await moduleRef.close();
  });

  it('should create order with product price calculation and persist to DB', async () => {
    // Arrange: Create product first
    const product = await prismaService.product.create({
      data: {
        name: 'Test Product',
        price: 50,
        stock: 100,
      },
    });

    // Act: Handler → ProductService → Repository → Real DB
    const command = new CreateOrderCommand('John Doe', product.id, 2);
    const result = await createHandler.execute(command);

    // Assert: Verify response and DB persistence
    expect(result).toMatchObject({
      id: expect.any(String),
      customerName: 'John Doe',
      totalAmount: 100, // 50 * 2
      status: 'pending',
    });

    const inDb = await prismaService.order.findUnique({
      where: { id: result.id },
    });
    expect(inDb).toBeDefined();
    expect(inDb?.customerName).toBe('John Doe');
    expect(inDb?.totalAmount).toBe(100);
  });

  it('should retrieve order from DB', async () => {
    // Arrange: Create order
    const created = await prismaService.order.create({
      data: {
        customerName: 'Test Customer',
        totalAmount: 150,
        status: 'pending',
        items: '[]',
      },
    });

    // Act: Handler → Repository → Real DB
    const query = new GetOrderQuery(created.id);
    const result = await getHandler.execute(query);

    // Assert
    expect(result).toMatchObject({
      id: created.id,
      customerName: 'Test Customer',
      totalAmount: 150,
      status: 'pending',
    });
  });

  it('should list and paginate orders from DB', async () => {
    // Arrange: Create multiple orders with bulk insert
    await prismaService.order.createMany({
      data: Array.from({ length: 10 }, (_, i) => ({
        customerName: `Customer ${i + 1}`,
        totalAmount: (i + 1) * 50,
        status: 'pending',
        items: '[]',
      })),
    });

    // Act & Assert: List all orders
    const allQuery = new ListOrdersQuery();
    const allResult = await listHandler.execute(allQuery);
    expect(allResult).toHaveLength(10);
    expect(allResult[0].customerName).toBeDefined();

    // Act & Assert: Test pagination
    const pageQuery = new ListOrdersQuery(3, 4);
    const pageResult = await listHandler.execute(pageQuery);
    expect(pageResult).toHaveLength(4);
  });

  it('should update order status in DB', async () => {
    // Arrange: Create order
    const created = await prismaService.order.create({
      data: {
        customerName: 'Customer',
        totalAmount: 100,
        status: 'pending',
        items: '[]',
      },
    });

    // Act: Handler → Repository → Real DB
    const command = new UpdateOrderCommand(created.id, 'completed');
    const result = await updateHandler.execute(command);

    // Assert: Verify response and DB persistence
    expect(result.status).toBe('completed');

    const inDb = await prismaService.order.findUnique({
      where: { id: created.id },
    });
    expect(inDb?.status).toBe('completed');
  });
});
