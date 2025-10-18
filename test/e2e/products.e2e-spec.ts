import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../../src/shared/filters/http-exception.filter';

describe('Products API (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;
  let createdProductId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same middleware as in production
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
    await prismaService.product.deleteMany({});
  });

  afterAll(async () => {
    await prismaService.product.deleteMany({});
    await prismaService.$disconnect();
    await app.close();
  });

  describe('POST /products', () => {
    it('should create a new product', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'E2E Test Product',
          description: 'E2E Test Description',
          price: 99.99,
          stock: 50,
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.name).toBe('E2E Test Product');
          expect(response.body.price).toBe(99.99);
          expect(response.body.stock).toBe(50);
          createdProductId = response.body.id;
        });
    });

    it('should fail to create product with invalid data', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: '',
          price: -10,
          stock: -5,
        })
        .expect(400);
    });

    it('should fail to create product with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          description: 'Only description',
        })
        .expect(400);
    });
  });

  describe('GET /products', () => {
    it('should return all products', () => {
      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThan(0);
        });
    });

    it('should return paginated products', () => {
      return request(app.getHttpServer())
        .get('/products?skip=0&take=5')
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeLessThanOrEqual(5);
        });
    });
  });

  describe('GET /products/:id', () => {
    it('should return a single product', () => {
      return request(app.getHttpServer())
        .get(`/products/${createdProductId}`)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(createdProductId);
          expect(response.body.name).toBe('E2E Test Product');
        });
    });

    it('should return 404 for non-existent product', () => {
      return request(app.getHttpServer())
        .get('/products/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('PATCH /products/:id', () => {
    it('should update a product', () => {
      return request(app.getHttpServer())
        .patch(`/products/${createdProductId}`)
        .send({
          name: 'Updated E2E Product',
          price: 149.99,
        })
        .expect(200)
        .then((response) => {
          expect(response.body.name).toBe('Updated E2E Product');
          expect(response.body.price).toBe(149.99);
        });
    });

    it('should return 404 when updating non-existent product', () => {
      return request(app.getHttpServer())
        .patch('/products/00000000-0000-0000-0000-000000000000')
        .send({
          name: 'Non-existent',
        })
        .expect(404);
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete a product', () => {
      return request(app.getHttpServer())
        .delete(`/products/${createdProductId}`)
        .expect(204);
    });

    it('should return 404 when deleting non-existent product', () => {
      return request(app.getHttpServer())
        .delete('/products/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });
});
