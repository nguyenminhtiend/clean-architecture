import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../../src/shared/filters/http-exception.filter';

export interface E2ETestContext {
  app: INestApplication<App>;
  prismaService: PrismaService;
}

/**
 * Creates and initializes a NestJS app for e2e testing with standard config
 */
export async function createE2ETestApp(): Promise<E2ETestContext> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

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

  const prismaService = moduleFixture.get<PrismaService>(PrismaService);

  return { app, prismaService };
}

/**
 * Cleans up and closes the e2e test app
 */
export async function closeE2ETestApp(context: E2ETestContext): Promise<void> {
  await context.prismaService.$disconnect();
  await context.app.close();
}
