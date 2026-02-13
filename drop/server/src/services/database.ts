/**
 * Database Client
 * Prisma client singleton
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient({
  log: [
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' },
  ],
});

// Log Prisma warnings and errors
prisma.$on('warn', (e) => {
  logger.warn({ prisma: e }, 'Prisma warning');
});

prisma.$on('error', (e) => {
  logger.error({ prisma: e }, 'Prisma error');
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export { prisma };
