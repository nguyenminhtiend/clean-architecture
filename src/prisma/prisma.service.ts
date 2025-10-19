import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const logLevels = process.env.PRISMA_LOG_LEVELS
      ? (process.env.PRISMA_LOG_LEVELS.split(',')
          .map((level) => level.trim())
          .filter((level) => level) as Prisma.LogLevel[])
      : [];

    super({
      log: logLevels,
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
