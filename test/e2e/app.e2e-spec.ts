import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createE2ETestApp, closeE2ETestApp, E2ETestContext } from '../helpers';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const context: E2ETestContext = await createE2ETestApp();
    app = context.app;
    prismaService = context.prismaService;
  });

  afterAll(async () => {
    await closeE2ETestApp({ app, prismaService });
  });

  it('/ (GET)', async () => {
    await request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
  });

  it('/health (GET) - should return health status', async () => {
    await request(app.getHttpServer()).get('/').expect(200);
  });
});
