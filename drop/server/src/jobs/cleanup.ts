/**
 * Cleanup Job
 * Background job to delete expired rooms
 */

import cron from 'node-cron';
import { prisma } from '../services/database';
import { roomService } from '../services/roomService';
import { config } from '../config';
import { logger } from '../utils/logger';

/**
 * Delete all expired rooms
 */
async function cleanupExpiredRooms(): Promise<void> {
  const startTime = Date.now();
  logger.info('Starting cleanup job');

  try {
    // Find all expired rooms
    const expiredRooms = await prisma.room.findMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
        isPinned: false, // Don't delete pinned rooms
      },
      select: {
        id: true,
      },
    });

    logger.info({ count: expiredRooms.length }, 'Found expired rooms');

    // Delete each room
    let successCount = 0;
    let failCount = 0;

    for (const room of expiredRooms) {
      try {
        await roomService.deleteRoom(room.id);
        successCount++;
      } catch (error) {
        failCount++;
        logger.error({ error, roomId: room.id }, 'Failed to delete expired room');
      }
    }

    const duration = Date.now() - startTime;
    logger.info(
      {
        successCount,
        failCount,
        duration,
      },
      'Cleanup job completed'
    );
  } catch (error) {
    logger.error({ error }, 'Cleanup job failed');
  }
}

/**
 * Start the cleanup cron job
 */
export function startCleanupJob(): void {
  const schedule = config.cleanup.cron;

  logger.info({ schedule }, 'Scheduling cleanup job');

  cron.schedule(schedule, () => {
    cleanupExpiredRooms().catch((error) => {
      logger.error({ error }, 'Unhandled error in cleanup job');
    });
  });
}

// Export for manual execution
export { cleanupExpiredRooms };
