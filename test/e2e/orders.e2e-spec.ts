import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../../src/shared/filters/http-exception.filter';

describe('Orders API (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;
  let createdProductId: string;
  let createdOrderId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    // Clean up database before tests
    await prismaService.order.deleteMany({});
    await prismaService.product.deleteMany({});

    // Create a test product for orders
    const product = await prismaService.product.create({
      data: {
        name: 'Test Product for Orders',
        description: 'Test Product',
        price: 100,
        stock: 100,
      },
    });
    createdProductId = product.id;
  });

  afterAll(async () => {
    await prismaService.order.deleteMany({});
    await prismaService.product.deleteMany({});
    await prismaService.$disconnect();
    await app.close();
  });

  describe('POST /orders', () => {
    it('should create a new order', () => {
      return request(app.getHttpServer())
        .post('/orders')
        .send({
          customerName: 'John Doe',
          productId: createdProductId,
          quantity: 3,
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.customerName).toBe('John Doe');
          expect(response.body.totalAmount).toBe(300); // 100 * 3
          expect(response.body.status).toBe('pending');
          expect(response.body.items).toHaveLength(1);
          createdOrderId = response.body.id;
        });
    });

    it('should fail to create order with non-existent product', () => {
      return request(app.getHttpServer())
        .post('/orders')
        .send({
          customerName: 'Jane Doe',
          productId: '00000000-0000-0000-0000-000000000000',
          quantity: 2,
        })
        .expect(404);
    });

    it('should fail to create order with invalid data', () => {
      return request(app.getHttpServer())
        .post('/orders')
        .send({
          customerName: '',
          productId: createdProductId,
          quantity: 0,
        })
        .expect(400);
    });
  });

  describe('GET /orders', () => {
    it('should return all orders', () => {
      return request(app.getHttpServer())
        .get('/orders')
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThan(0);
        });
    });

    it('should return paginated orders', () => {
      return request(app.getHttpServer())
        .get('/orders?skip=0&take=10')
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
        });
    });
  });

  describe('GET /orders/:id', () => {
    it('should return a single order', () => {
      return request(app.getHttpServer())
        .get(`/orders/${createdOrderId}`)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(createdOrderId);
          expect(response.body.customerName).toBe('John Doe');
          expect(response.body.items).toBeDefined();
        });
    });

    it('should return 404 for non-existent order', () => {
      return request(app.getHttpServer())
        .get('/orders/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('PATCH /orders/:id', () => {
    it('should update order status', () => {
      return request(app.getHttpServer())
        .patch(`/orders/${createdOrderId}`)
        .send({
          status: 'completed',
        })
        .expect(200)
        .then((response) => {
          expect(response.body.status).toBe('completed');
        });
    });

    it('should return 404 when updating non-existent order', () => {
      return request(app.getHttpServer())
        .patch('/orders/00000000-0000-0000-0000-000000000000')
        .send({
          status: 'completed',
        })
        .expect(404);
    });
  });

  describe('Order Workflow', () => {
    it('should complete full order lifecycle', async () => {
      // Create order
      const createResponse = await request(app.getHttpServer())
        .post('/orders')
        .send({
          customerName: 'Alice Smith',
          productId: createdProductId,
          quantity: 2,
        })
        .expect(201);

      const orderId = createResponse.body.id;

      // Get order
      await request(app.getHttpServer()).get(`/orders/${orderId}`).expect(200);

      // Update order status to processing
      await request(app.getHttpServer())
        .patch(`/orders/${orderId}`)
        .send({ status: 'processing' })
        .expect(200);

      // Update order status to completed
      const updateResponse = await request(app.getHttpServer())
        .patch(`/orders/${orderId}`)
        .send({ status: 'completed' })
        .expect(200);

      expect(updateResponse.body.status).toBe('completed');
    });
  });
});
