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
  expectProductShape,
} from '../helpers';

describe('Products API (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const context: E2ETestContext = await createE2ETestApp();
    app = context.app;
    prismaService = context.prismaService;
  });

  beforeEach(async () => {
    // Clean up database before each test for isolation
    await prismaService.product.deleteMany({});
  });

  afterAll(async () => {
    // Final cleanup
    await prismaService.product.deleteMany({});
    await closeE2ETestApp({ app, prismaService });
  });

  describe('Product Lifecycle', () => {
    it('should complete full product lifecycle (create → read → update → delete)', async () => {
      // Create
      const createResponse = await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'E2E Test Product',
          description: 'E2E Test Description',
          price: 99.99,
          stock: 50,
        });

      expectCreatedResponse(createResponse);
      expectProductShape(createResponse.body);
      const productId = createResponse.body.id;

      // Read
      const getResponse = await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(200);
      expect(getResponse.body.name).toBe('E2E Test Product');

      // Update
      const updateResponse = await request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .send({ name: 'Updated Product', price: 149.99 })
        .expect(200);
      expect(updateResponse.body.name).toBe('Updated Product');

      // Delete
      await request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .expect(204);

      // Verify deletion
      await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(404);
    });
  });

  describe('GET /products', () => {
    it('should return paginated products', async () => {
      // Create test products
      await request(app.getHttpServer())
        .post('/products')
        .send({ name: 'Product 1', price: 10, stock: 5 });
      await request(app.getHttpServer())
        .post('/products')
        .send({ name: 'Product 2', price: 20, stock: 5 });

      const response = await request(app.getHttpServer())
        .get('/products?skip=0&take=1')
        .expect(200);

      expectArrayResponse(response, 1);
    });
  });
});
