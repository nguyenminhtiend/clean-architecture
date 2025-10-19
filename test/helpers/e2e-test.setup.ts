import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createTestApp, closeTestApp } from './test-app.setup';

export interface E2ETestContext {
  app: INestApplication<App>;
  prismaService: PrismaService;
}

/**
 * Creates and initializes a NestJS app for e2e testing with standard config
 */
export async function createE2ETestApp(): Promise<E2ETestContext> {
  const context = await createTestApp({
    createApp: true,
    applyExceptionFilter: true,
    forbidNonWhitelisted: true,
  });

  return { app: context.app!, prismaService: context.prismaService };
}

/**
 * Cleans up and closes the e2e test app
 */
export async function closeE2ETestApp(context: E2ETestContext): Promise<void> {
  await closeTestApp({
    app: context.app,
    module: null as any,
    prismaService: context.prismaService,
  });
}
