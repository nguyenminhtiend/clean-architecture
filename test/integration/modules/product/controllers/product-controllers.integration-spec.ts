import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ProductModule } from '../../../../../src/modules/product/product.module';
import { PrismaService } from '../../../../../src/prisma/prisma.service';
import { clearDatabase } from '../../../../helpers/test-db-setup';
import {
  createTestApp,
  closeTestApp,
  TestAppContext,
} from '../../../../helpers/test-app.setup';

describe('Product Controllers Integration (HTTP + Validation)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let context: TestAppContext;

  beforeAll(async () => {
    context = await createTestApp({
      moduleToImport: ProductModule,
      createApp: true,
      applyExceptionFilter: false,
      forbidNonWhitelisted: false,
    });

    app = context.app!;
    prismaService = context.prismaService;
  });

  beforeEach(async () => {
    await clearDatabase(prismaService);
  });

  afterAll(async () => {
    await clearDatabase(prismaService);
    await closeTestApp(context);
  });

  describe('POST /products - DTO Validation', () => {
    it('should create product with valid DTO and handle transformations', async () => {
      // Valid DTO
      const validResponse = await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Valid Product',
          description: 'Valid Description',
          price: 99.99,
          stock: 50,
        })
        .expect(201);

      expect(validResponse.body).toMatchObject({
        id: expect.any(String),
        name: 'Valid Product',
        price: 99.99,
        stock: 50,
      });

      // String to number transformation
      const transformResponse = await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Transform Product',
          price: '25.50',
          stock: '10',
        })
        .expect(201);

      expect(typeof transformResponse.body.price).toBe('number');
      expect(transformResponse.body.price).toBe(25.5);

      // Whitelist unknown fields
      const whitelistResponse = await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          price: 100,
          stock: 10,
          unknownField: 'should be stripped',
        })
        .expect(201);

      expect(whitelistResponse.body.unknownField).toBeUndefined();
    });

    it('should reject invalid DTO fields', async () => {
      // Empty name
      const emptyNameRes = await request(app.getHttpServer())
        .post('/products')
        .send({ name: '', price: 100, stock: 10 })
        .expect(400);
      expect(emptyNameRes.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('name')]),
      );

      // Negative price
      const negativePriceRes = await request(app.getHttpServer())
        .post('/products')
        .send({ name: 'Product', price: -10, stock: 10 })
        .expect(400);
      expect(negativePriceRes.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('price')]),
      );

      // Negative stock
      await request(app.getHttpServer())
        .post('/products')
        .send({ name: 'Product', price: 100, stock: -5 })
        .expect(400);

      // Missing required fields
      const missingFieldsRes = await request(app.getHttpServer())
        .post('/products')
        .send({ description: 'Only description' })
        .expect(400);
      expect(missingFieldsRes.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('name'),
          expect.stringContaining('price'),
        ]),
      );
    });
  });

  describe('GET /products - Query Parameters', () => {
    beforeEach(async () => {
      // Create test data
      for (let i = 1; i <= 15; i++) {
        await prismaService.product.create({
          data: { name: `Product ${i}`, price: i * 10, stock: i },
        });
      }
    });

    it('should handle skip and take query params', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/products?skip=5&take=5')
        .expect(200);

      // Assert
      expect(response.body).toHaveLength(5);
    });

    it('should transform string skip/take to numbers', async () => {
      // Act: Query params are always strings
      const response = await request(app.getHttpServer())
        .get('/products?skip=10&take=3')
        .expect(200);

      // Assert: Should work correctly
      expect(response.body).toHaveLength(3);
    });

    it('should work without pagination params', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      // Assert: Should return all products
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /products/:id', () => {
    it('should return product by ID or 404 if not found', async () => {
      // Success case
      const created = await prismaService.product.create({
        data: { name: 'Test', price: 100, stock: 10 },
      });

      const response = await request(app.getHttpServer())
        .get(`/products/${created.id}`)
        .expect(200);

      expect(response.body.id).toBe(created.id);

      // Not found case
      await request(app.getHttpServer())
        .get('/products/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('PATCH /products/:id - Update DTO Validation', () => {
    it('should validate update DTO and handle partial updates', async () => {
      const created = await prismaService.product.create({
        data: { name: 'Original', price: 100, stock: 10 },
      });

      // Valid partial update
      const validRes = await request(app.getHttpServer())
        .patch(`/products/${created.id}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(validRes.body.name).toBe('Updated Name');

      // Invalid update (negative price)
      await request(app.getHttpServer())
        .patch(`/products/${created.id}`)
        .send({ price: -50 })
        .expect(400);

      // Single field update
      const singleRes = await request(app.getHttpServer())
        .patch(`/products/${created.id}`)
        .send({ stock: 100 })
        .expect(200);

      expect(singleRes.body.stock).toBe(100);
      expect(singleRes.body.name).toBe('Updated Name'); // Previous update
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete product and return 204 or 404 if not found', async () => {
      // Success case
      const created = await prismaService.product.create({
        data: { name: 'To Delete', price: 100, stock: 10 },
      });

      const response = await request(app.getHttpServer())
        .delete(`/products/${created.id}`)
        .expect(204);

      expect(response.body).toEqual({});

      // Not found case
      await request(app.getHttpServer())
        .delete('/products/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });
});
