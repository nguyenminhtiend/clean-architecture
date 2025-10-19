import { INestApplication, ValidationPipe, Type } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../../src/shared/filters/http-exception.filter';

export interface TestAppContext {
  app?: INestApplication<App>;
  module: TestingModule;
  prismaService: PrismaService;
}

export interface TestAppOptions {
  /**
   * Module to import. Defaults to AppModule for e2e tests.
   */
  moduleToImport?: Type<any>;
  /**
   * Whether to create NestApplication. Set to false for handler-only integration tests.
   */
  createApp?: boolean;
  /**
   * Whether to apply HttpExceptionFilter. Defaults to true when createApp is true.
   */
  applyExceptionFilter?: boolean;
  /**
   * Whether to apply forbidNonWhitelisted validation. Defaults to true for e2e, can be false for integration.
   */
  forbidNonWhitelisted?: boolean;
}

/**
 * Creates and initializes a NestJS test context for e2e or integration testing
 */
export async function createTestApp(options: TestAppOptions = {}): Promise<TestAppContext> {
  const {
    moduleToImport = AppModule,
    createApp = true,
    applyExceptionFilter = true,
    forbidNonWhitelisted = true,
  } = options;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [moduleToImport],
  }).compile();

  let app: INestApplication<App> | undefined;

  if (createApp) {
    app = moduleFixture.createNestApplication();

    // Apply validation pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted,
        transform: true,
      }),
    );

    // Apply exception filter for e2e tests
    if (applyExceptionFilter) {
      app.useGlobalFilters(new HttpExceptionFilter());
    }

    await app.init();
  } else {
    await moduleFixture.init();
  }

  const prismaService = moduleFixture.get<PrismaService>(PrismaService);

  return { app, module: moduleFixture, prismaService };
}

/**
 * Cleans up and closes the test app context
 */
export async function closeTestApp(context: TestAppContext): Promise<void> {
  await context.prismaService.$disconnect();
  if (context.app) {
    await context.app.close();
  } else {
    await context.module.close();
  }
}
