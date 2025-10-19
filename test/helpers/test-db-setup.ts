import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

/**
 * Setup test database - Note: Database and migrations should be set up beforehand
 * Run: DATABASE_URL="postgresql://postgres:postgres@localhost:5432/clean_architecture_test?schema=public" npx prisma migrate deploy
 */
export async function setupTestDatabase(): Promise<void> {
  // Just initialize the Prisma client - migrations should be done beforehand
  getPrismaClient();
}

/**
 * Clear all data from the database using the provided PrismaService
 */
export async function clearDatabase(prismaService?: any): Promise<void> {
  const client = prismaService || getPrismaClient();

  try {
    // Delete in order to respect foreign key constraints
    await client.order.deleteMany({});
    await client.product.deleteMany({});
  } catch (error) {
    console.error('Failed to clear database:', error);
    throw error;
  }
}

/**
 * Teardown test database - closes connection
 */
export async function teardownTestDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}
