import { ProductModule } from '../../../../../src/modules/product/product.module';
import { PrismaService } from '../../../../../src/prisma/prisma.service';
import {
  CreateProductHandler,
  UpdateProductHandler,
  DeleteProductHandler,
} from '../../../../../src/modules/product/commands';
import { GetProductHandler, ListProductsHandler } from '../../../../../src/modules/product/queries';
import {
  CreateProductCommand,
  UpdateProductCommand,
  DeleteProductCommand,
} from '../../../../../src/modules/product/commands';
import { GetProductQuery, ListProductsQuery } from '../../../../../src/modules/product/queries';
import { clearDatabase } from '../../../../helpers/test-db-setup';
import { createTestApp, closeTestApp, TestAppContext } from '../../../../helpers/test-app.setup';

describe('Product Handlers Integration (Real DB)', () => {
  let context: TestAppContext;
  let prismaService: PrismaService;
  let createHandler: CreateProductHandler;
  let updateHandler: UpdateProductHandler;
  let deleteHandler: DeleteProductHandler;
  let getHandler: GetProductHandler;
  let listHandler: ListProductsHandler;

  beforeAll(async () => {
    context = await createTestApp({
      moduleToImport: ProductModule,
      createApp: false,
    });

    prismaService = context.prismaService;
    createHandler = context.module.get<CreateProductHandler>(CreateProductHandler);
    updateHandler = context.module.get<UpdateProductHandler>(UpdateProductHandler);
    deleteHandler = context.module.get<DeleteProductHandler>(DeleteProductHandler);
    getHandler = context.module.get<GetProductHandler>(GetProductHandler);
    listHandler = context.module.get<ListProductsHandler>(ListProductsHandler);
  });

  beforeEach(async () => {
    await clearDatabase(prismaService);
  });

  afterAll(async () => {
    await clearDatabase(prismaService);
    await closeTestApp(context);
  });

  it('should create and persist product to DB', async () => {
    // Arrange
    const command = new CreateProductCommand('Integration Product', 'Test Description', 99.99, 50);

    // Act: Handler → Repository → Real DB
    const result = await createHandler.execute(command);

    // Assert: Verify response and DB persistence
    expect(result).toMatchObject({
      id: expect.any(String),
      name: 'Integration Product',
      description: 'Test Description',
      price: 99.99,
      stock: 50,
    });

    const inDb = await prismaService.product.findUnique({
      where: { id: result.id },
    });
    expect(inDb).toBeDefined();
    expect(inDb?.name).toBe('Integration Product');
  });

  it('should retrieve product from DB', async () => {
    // Arrange: Create product
    const created = await prismaService.product.create({
      data: {
        name: 'Test Product',
        description: 'Test',
        price: 100,
        stock: 20,
      },
    });

    // Act: Handler → Repository → Real DB
    const query = new GetProductQuery(created.id);
    const result = await getHandler.execute(query);

    // Assert
    expect(result).toMatchObject({
      id: created.id,
      name: 'Test Product',
      price: 100,
      stock: 20,
    });
  });

  it('should list and paginate products from DB', async () => {
    // Arrange: Create multiple products with bulk insert
    await prismaService.product.createMany({
      data: Array.from({ length: 10 }, (_, i) => ({
        name: `Product ${i + 1}`,
        price: (i + 1) * 10,
        stock: i + 1,
      })),
    });

    // Act & Assert: List all products
    const allQuery = new ListProductsQuery();
    const allResult = await listHandler.execute(allQuery);
    expect(allResult).toHaveLength(10);
    expect(allResult[0].name).toBeDefined();

    // Act & Assert: Test pagination
    const pageQuery = new ListProductsQuery(5, 3);
    const pageResult = await listHandler.execute(pageQuery);
    expect(pageResult).toHaveLength(3);
  });

  it('should update product in DB', async () => {
    // Arrange: Create product
    const created = await prismaService.product.create({
      data: {
        name: 'Original Name',
        description: 'Original',
        price: 100,
        stock: 10,
      },
    });

    // Act: Handler → Repository → Real DB
    const command = new UpdateProductCommand(created.id, 'Updated Name', undefined, 200, undefined);
    const result = await updateHandler.execute(command);

    // Assert: Verify response and DB persistence
    expect(result.name).toBe('Updated Name');
    expect(result.price).toBe(200);

    const inDb = await prismaService.product.findUnique({
      where: { id: created.id },
    });
    expect(inDb?.name).toBe('Updated Name');
    expect(inDb?.price).toBe(200);
  });

  it('should delete product from DB', async () => {
    // Arrange: Create product
    const created = await prismaService.product.create({
      data: { name: 'To Delete', price: 100, stock: 10 },
    });

    // Act: Handler → Repository → Real DB
    const command = new DeleteProductCommand(created.id);
    await deleteHandler.execute(command);

    // Assert: Verify actual deletion from DB
    const inDb = await prismaService.product.findUnique({
      where: { id: created.id },
    });
    expect(inDb).toBeNull();
  });
});
