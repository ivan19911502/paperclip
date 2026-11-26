import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { sportpulsePrisma?: PrismaClient };

export const prisma = globalForPrisma.sportpulsePrisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.sportpulsePrisma = prisma;
