import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';

export type MockPrismaContext = {
  prisma: DeepMockProxy<PrismaClient>;
};

export const createMockPrismaService = (): DeepMockProxy<PrismaClient> => {
  return mockDeep<PrismaClient>();
};

export const resetMockPrismaService = (prisma: DeepMockProxy<PrismaClient>): void => {
  mockReset(prisma);
};
