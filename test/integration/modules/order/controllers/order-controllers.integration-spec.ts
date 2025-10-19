import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { OrderModule } from '../../../../../src/modules/order/order.module';
import { PrismaService } from '../../../../../src/prisma/prisma.service';
import { clearDatabase } from '../../../../helpers/test-db-setup';

describe('Order Controllers Integration (HTTP + Validation)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [OrderModule],
    }).compile();

    app = moduleRef.createNestApplication();

    // Apply validation pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prismaService = moduleRef.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await clearDatabase(prismaService);
  });

  afterAll(async () => {
    await clearDatabase(prismaService);
    await app.close();
  });

  describe('POST /orders - DTO Validation', () => {
    let productId: string;

    beforeEach(async () => {
      const product = await prismaService.product.create({
        data: { name: 'Test Product', price: 50, stock: 100 },
      });
      productId = product.id;
    });

    it('should create order with valid DTO and handle transformations', async () => {
      // Valid DTO
      const validResponse = await request(app.getHttpServer())
        .post('/orders')
        .send({
          customerName: 'John Doe',
          productId: productId,
          quantity: 2,
        })
        .expect(201);

      expect(validResponse.body).toMatchObject({
        id: expect.any(String),
        customerName: 'John Doe',
        totalAmount: 100,
        status: 'pending',
      });

      // String to number transformation
      const transformResponse = await request(app.getHttpServer())
        .post('/orders')
        .send({
          customerName: 'Jane Doe',
          productId: productId,
          quantity: '3',
        })
        .expect(201);

      expect(transformResponse.body.totalAmount).toBe(150);
    });

    it('should reject invalid DTO fields', async () => {
      // Empty customer name
      const emptyNameRes = await request(app.getHttpServer())
        .post('/orders')
        .send({ customerName: '', productId, quantity: 1 })
        .expect(400);
      expect(emptyNameRes.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('customerName')]),
      );

      // Negative quantity
      const negativeQtyRes = await request(app.getHttpServer())
        .post('/orders')
        .send({ customerName: 'John', productId, quantity: -1 })
        .expect(400);
      expect(negativeQtyRes.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('quantity')]),
      );

      // Zero quantity
      await request(app.getHttpServer())
        .post('/orders')
        .send({ customerName: 'John', productId, quantity: 0 })
        .expect(400);

      // Missing required fields
      await request(app.getHttpServer())
        .post('/orders')
        .send({ customerName: 'John' })
        .expect(400);

      // Non-existent product
      await request(app.getHttpServer())
        .post('/orders')
        .send({
          customerName: 'John',
          productId: '00000000-0000-0000-0000-000000000000',
          quantity: 1,
        })
        .expect(404);
    });
  });

  describe('GET /orders - Query Parameters', () => {
    beforeEach(async () => {
      // Create test data
      for (let i = 1; i <= 10; i++) {
        await prismaService.order.create({
          data: {
            customerName: `Customer ${i}`,
            totalAmount: i * 50,
            status: 'pending',
            items: '[]',
          },
        });
      }
    });

    it('should handle skip and take query params', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/orders?skip=3&take=4')
        .expect(200);

      // Assert
      expect(response.body).toHaveLength(4);
    });

    it('should work without pagination params', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/orders')
        .expect(200);

      // Assert
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /orders/:id', () => {
    it('should return order by ID or 404 if not found', async () => {
      // Success case
      const created = await prismaService.order.create({
        data: {
          customerName: 'Test',
          totalAmount: 100,
          status: 'pending',
          items: '[]',
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/orders/${created.id}`)
        .expect(200);

      expect(response.body.id).toBe(created.id);

      // Not found case
      await request(app.getHttpServer())
        .get('/orders/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('PATCH /orders/:id - Update DTO Validation', () => {
    it('should validate update DTO and handle status changes', async () => {
      // Test completed status
      const order1 = await prismaService.order.create({
        data: {
          customerName: 'Customer',
          totalAmount: 100,
          status: 'pending',
          items: '[]',
        },
      });

      const completedRes = await request(app.getHttpServer())
        .patch(`/orders/${order1.id}`)
        .send({ status: 'completed' })
        .expect(200);

      expect(completedRes.body.status).toBe('completed');

      // Test cancelled status on a fresh order
      const order2 = await prismaService.order.create({
        data: {
          customerName: 'Customer 2',
          totalAmount: 100,
          status: 'pending',
          items: '[]',
        },
      });

      const cancelledRes = await request(app.getHttpServer())
        .patch(`/orders/${order2.id}`)
        .send({ status: 'cancelled' })
        .expect(200);

      expect(cancelledRes.body.status).toBe('cancelled');

      // Invalid status
      await request(app.getHttpServer())
        .patch(`/orders/${order1.id}`)
        .send({ status: 'invalid-status' })
        .expect(500);

      // Empty status
      await request(app.getHttpServer())
        .patch(`/orders/${order1.id}`)
        .send({})
        .expect(500);
    });
  });
});
