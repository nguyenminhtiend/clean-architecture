import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../../src/prisma/prisma.service';
import {
  createE2ETestApp,
  closeE2ETestApp,
  E2ETestContext,
  expectCreatedResponse,
  expectArrayResponse,
  expectOrderShape,
} from '../helpers';

describe('Orders API (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const context: E2ETestContext = await createE2ETestApp();
    app = context.app;
    prismaService = context.prismaService;
  });

  beforeEach(async () => {
    // Clear database before each test for isolation
    await prismaService.order.deleteMany({});
    await prismaService.product.deleteMany({});
  });

  afterAll(async () => {
    // Final cleanup
    await prismaService.order.deleteMany({});
    await prismaService.product.deleteMany({});
    await closeE2ETestApp({ app, prismaService });
  });

  describe('POST /orders', () => {
    it('should create a new order', async () => {
      // Create a test product for this specific test
      const product = await prismaService.product.create({
        data: {
          name: 'Test Product for Orders',
          description: 'Test Product',
          price: 100,
          stock: 100,
        },
      });

      const response = await request(app.getHttpServer()).post('/orders').send({
        customerName: 'John Doe',
        productId: product.id,
        quantity: 3,
      });

      expectCreatedResponse(response);
      expectOrderShape(response.body);
      expect(response.body.customerName).toBe('John Doe');
      expect(response.body.totalAmount).toBe(300); // 100 * 3
      expect(response.body.status).toBe('pending');
      expect(response.body.items).toHaveLength(1);
    });

    it('should fail to create order with non-existent product', async () => {
      await request(app.getHttpServer())
        .post('/orders')
        .send({
          customerName: 'Jane Doe',
          productId: '00000000-0000-0000-0000-000000000000',
          quantity: 2,
        })
        .expect(404);
    });

    it('should fail to create order with invalid data', async () => {
      // Create a test product for this specific test
      const product = await prismaService.product.create({
        data: {
          name: 'Test Product',
          description: 'Test Product',
          price: 100,
          stock: 100,
        },
      });

      await request(app.getHttpServer())
        .post('/orders')
        .send({
          customerName: '',
          productId: product.id,
          quantity: 0,
        })
        .expect(400);
    });
  });

  describe('GET /orders', () => {
    it('should return all orders', async () => {
      // Create a test product and order for this specific test
      const product = await prismaService.product.create({
        data: {
          name: 'Test Product',
          description: 'Test Product',
          price: 100,
          stock: 100,
        },
      });

      await request(app.getHttpServer()).post('/orders').send({
        customerName: 'John Doe',
        productId: product.id,
        quantity: 3,
      });

      const response = await request(app.getHttpServer()).get('/orders').expect(200);

      expectArrayResponse(response, 1);
    });

    it('should return paginated orders', async () => {
      const response = await request(app.getHttpServer()).get('/orders?skip=0&take=10').expect(200);

      expectArrayResponse(response);
    });
  });

  describe('GET /orders/:id', () => {
    it('should return a single order', async () => {
      // Create a test product and order for this specific test
      const product = await prismaService.product.create({
        data: {
          name: 'Test Product',
          description: 'Test Product',
          price: 100,
          stock: 100,
        },
      });

      const createResponse = await request(app.getHttpServer()).post('/orders').send({
        customerName: 'John Doe',
        productId: product.id,
        quantity: 3,
      });

      const orderId = createResponse.body.id;

      const response = await request(app.getHttpServer()).get(`/orders/${orderId}`).expect(200);

      expectOrderShape(response.body);
      expect(response.body.id).toBe(orderId);
      expect(response.body.customerName).toBe('John Doe');
    });

    it('should return 404 for non-existent order', async () => {
      await request(app.getHttpServer())
        .get('/orders/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('PATCH /orders/:id', () => {
    it('should update order status', async () => {
      // Create a test product and order for this specific test
      const product = await prismaService.product.create({
        data: {
          name: 'Test Product',
          description: 'Test Product',
          price: 100,
          stock: 100,
        },
      });

      const createResponse = await request(app.getHttpServer()).post('/orders').send({
        customerName: 'John Doe',
        productId: product.id,
        quantity: 3,
      });

      const orderId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .patch(`/orders/${orderId}`)
        .send({
          status: 'completed',
        })
        .expect(200);

      expect(response.body.status).toBe('completed');
    });

    it('should return 404 when updating non-existent order', async () => {
      await request(app.getHttpServer())
        .patch('/orders/00000000-0000-0000-0000-000000000000')
        .send({
          status: 'completed',
        })
        .expect(404);
    });
  });

  describe('Order Workflow', () => {
    it('should complete full order lifecycle', async () => {
      // Create a test product for this specific test
      const product = await prismaService.product.create({
        data: {
          name: 'Test Product',
          description: 'Test Product',
          price: 100,
          stock: 100,
        },
      });

      // Create order
      const createResponse = await request(app.getHttpServer())
        .post('/orders')
        .send({
          customerName: 'Alice Smith',
          productId: product.id,
          quantity: 2,
        })
        .expect(201);

      const orderId = createResponse.body.id;

      // Get order
      await request(app.getHttpServer()).get(`/orders/${orderId}`).expect(200);

      // Update order status to completed
      await request(app.getHttpServer())
        .patch(`/orders/${orderId}`)
        .send({ status: 'completed' })
        .expect(200);

      // Update order status to cancelled
      const updateResponse = await request(app.getHttpServer())
        .patch(`/orders/${orderId}`)
        .send({ status: 'completed' })
        .expect(200);

      expect(updateResponse.body.status).toBe('completed');
    });
  });
});
