/**
 * Room Service
 * Business logic for room operations
 */

import { nanoid, customAlphabet } from 'nanoid';
import { prisma } from './database';
import { storage } from './storage';
import { config } from '../config';
import { logger } from '../utils/logger';
import type { Room, RoomItem } from '@prisma/client';
import type { ContentType } from '../../../shared/types';

// Custom alphabet for room IDs (URL-safe, no ambiguous characters)
const generateRoomId = customAlphabet('0123456789ABCDEFGHJKMNPQRSTVWXYZabcdefghjkmnpqrstvwxyz', 12);

export class RoomService {
  /**
   * Create a new room
   */
  async createRoom(): Promise<Room> {
    const id = generateRoomId();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt);
    expiresAt.setDate(expiresAt.getDate() + config.room.ttlDays);

    const room = await prisma.room.create({
      data: {
        id,
        createdAt,
        expiresAt,
      },
    });

    logger.info({ roomId: room.id }, 'Room created');
    return room;
  }

  /**
   * Get room by ID with all items
   */
  async getRoom(roomId: string): Promise<{ room: Room; items: RoomItem[] } | null> {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!room) {
      return null;
    }

    return {
      room,
      items: room.items,
    };
  }

  /**
   * Check if room exists and is not expired
   */
  async isRoomValid(roomId: string): Promise<boolean> {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return false;
    }

    if (room.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  /**
   * Create a text or code item in a room
   */
  async createTextItem(
    roomId: string,
    type: 'text' | 'code',
    content: string,
    metadata?: Record<string, any>
  ): Promise<RoomItem> {
    // Check room validity
    const isValid = await this.isRoomValid(roomId);
    if (!isValid) {
      throw new Error('Room not found or expired');
    }

    // Check item count
    const itemCount = await prisma.roomItem.count({
      where: { roomId },
    });

    if (itemCount >= config.limits.maxItemsPerRoom) {
      throw new Error('Room item limit reached');
    }

    const item = await prisma.roomItem.create({
      data: {
        roomId,
        type,
        content,
        metadata: metadata || {},
      },
    });

    logger.info({ roomId, itemId: item.id, type }, 'Text item created');
    return item;
  }

  /**
   * Create a file item (image or PDF) in a room
   */
  async createFileItem(
    roomId: string,
    type: 'image' | 'pdf',
    buffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<RoomItem> {
    // Check room validity
    const isValid = await this.isRoomValid(roomId);
    if (!isValid) {
      throw new Error('Room not found or expired');
    }

    // Check item count
    const itemCount = await prisma.roomItem.count({
      where: { roomId },
    });

    if (itemCount >= config.limits.maxItemsPerRoom) {
      throw new Error('Room item limit reached');
    }

    // Generate file key
    const extension = fileName.split('.').pop() || 'bin';
    const fileKey = `${roomId}/${nanoid()}.${extension}`;

    // Upload to storage
    await storage.upload(fileKey, buffer, mimeType);

    // Create database record
    const item = await prisma.roomItem.create({
      data: {
        roomId,
        type,
        fileKey,
        fileName,
        fileSize: buffer.length,
        mimeType,
      },
    });

    logger.info({ roomId, itemId: item.id, type, fileKey }, 'File item created');
    return item;
  }

  /**
   * Get signed URL for a file item
   */
  async getFileUrl(itemId: string): Promise<string> {
    const item = await prisma.roomItem.findUnique({
      where: { id: itemId },
    });

    if (!item || !item.fileKey) {
      throw new Error('Item not found or is not a file');
    }

    return storage.getSignedUrl(item.fileKey, 3600); // 1 hour expiry
  }

  /**
   * Delete an item from a room
   */
  async deleteItem(itemId: string): Promise<void> {
    const item = await prisma.roomItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new Error('Item not found');
    }

    // Delete file from storage if exists
    if (item.fileKey) {
      try {
        await storage.delete(item.fileKey);
      } catch (error) {
        logger.error({ error, itemId, fileKey: item.fileKey }, 'Failed to delete file from storage');
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete from database
    await prisma.roomItem.delete({
      where: { id: itemId },
    });

    logger.info({ itemId, roomId: item.roomId }, 'Item deleted');
  }

  /**
   * Delete a room and all its contents
   */
  async deleteRoom(roomId: string): Promise<void> {
    const result = await this.getRoom(roomId);
    if (!result) {
      throw new Error('Room not found');
    }

    const { items } = result;

    // Delete all files from storage
    for (const item of items) {
      if (item.fileKey) {
        try {
          await storage.delete(item.fileKey);
        } catch (error) {
          logger.error({ error, itemId: item.id, fileKey: item.fileKey }, 'Failed to delete file from storage');
        }
      }
    }

    // Delete room (cascades to items)
    await prisma.room.delete({
      where: { id: roomId },
    });

    logger.info({ roomId, itemCount: items.length }, 'Room deleted');
  }

  /**
   * Get all items with file URLs included
   */
  async getItemsWithUrls(roomId: string): Promise<RoomItem[]> {
    const result = await this.getRoom(roomId);
    if (!result) {
      throw new Error('Room not found');
    }

    const { items } = result;

    // Generate signed URLs for file items
    const itemsWithUrls = await Promise.all(
      items.map(async (item) => {
        if (item.fileKey) {
          try {
            const url = await storage.getSignedUrl(item.fileKey, 3600);
            return {
              ...item,
              metadata: {
                ...((item.metadata as object) || {}),
                url,
              },
            };
          } catch (error) {
            logger.error({ error, itemId: item.id, fileKey: item.fileKey }, 'Failed to generate signed URL');
            return item;
          }
        }
        return item;
      })
    );

    return itemsWithUrls;
  }
}

// Export singleton instance
export const roomService = new RoomService();
