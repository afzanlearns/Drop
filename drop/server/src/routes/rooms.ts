/**
 * Room Routes
 * API endpoints for room operations
 */

import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { roomService } from '../services/roomService';
import { storage } from '../services/storage';
import { validateBody, validateParams } from '../middleware/validation';
import { createRoomLimiter, uploadLimiter, apiLimiter } from '../middleware/rateLimiter';
import { upload } from '../utils/upload';
import { AppError } from '../middleware/errorHandler';
import archiver from 'archiver';

const router = express.Router();

// Apply general rate limiting to all routes
router.use(apiLimiter);

/**
 * POST /api/rooms
 * Create a new room
 */
router.post('/', createRoomLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const room = await roomService.createRoom();
    res.status(201).json({ room });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/rooms/:id
 * Get room details and all items
 */
const getRoomSchema = z.object({
  id: z.string().min(1),
});

router.get(
  '/:id',
  validateParams(getRoomSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await roomService.getRoom(id);

      if (!result) {
        throw new AppError('Room not found', 404);
      }

      const { room, items } = result;

      // Generate signed URLs for file items
      const itemsWithUrls = await Promise.all(
        items.map(async (item) => {
          if (item.fileKey) {
            try {
              const url = await storage.getSignedUrl(item.fileKey, 3600);
              return {
                ...item,
                url,
              };
            } catch (error) {
              return item;
            }
          }
          return item;
        })
      );

      res.json({
        room,
        items: itemsWithUrls,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/rooms/:id/items
 * Create a text or code item
 */
const createItemSchema = z.object({
  type: z.enum(['text', 'code']),
  content: z.string().min(1).max(1000000), // Max 1MB of text
  metadata: z.record(z.any()).optional(),
});

router.post(
  '/:id/items',
  validateParams(getRoomSchema),
  validateBody(createItemSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { type, content, metadata } = req.body;

      const item = await roomService.createTextItem(id, type, content, metadata);

      res.status(201).json({ item });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/rooms/:id/items/upload
 * Upload a file (image or PDF)
 */
router.post(
  '/:id/items/upload',
  validateParams(getRoomSchema),
  uploadLimiter,
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const file = req.file;

      if (!file) {
        throw new AppError('No file provided', 400);
      }

      // Determine content type
      let type: 'image' | 'pdf';
      if (file.mimetype.startsWith('image/')) {
        type = 'image';
      } else if (file.mimetype === 'application/pdf') {
        type = 'pdf';
      } else {
        throw new AppError('Invalid file type', 400);
      }

      const item = await roomService.createFileItem(
        id,
        type,
        file.buffer,
        file.originalname,
        file.mimetype
      );

      // Generate signed URL for immediate access
      let url: string | undefined;
      if (item.fileKey) {
        url = await storage.getSignedUrl(item.fileKey, 3600);
      }

      res.status(201).json({
        item: {
          ...item,
          url,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/rooms/:roomId/items/:itemId
 * Delete an item from a room
 */
const deleteItemSchema = z.object({
  roomId: z.string().min(1),
  itemId: z.string().min(1),
});

router.delete(
  '/:roomId/items/:itemId',
  validateParams(deleteItemSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { itemId } = req.params;
      await roomService.deleteItem(itemId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/rooms/:id
 * Delete a room and all its contents
 */
router.delete(
  '/:id',
  validateParams(getRoomSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await roomService.deleteRoom(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/rooms/:id/export
 * Export room contents as ZIP
 */
router.get(
  '/:id/export',
  validateParams(getRoomSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await roomService.getRoom(id);

      if (!result) {
        throw new AppError('Room not found', 404);
      }

      const { room, items } = result;

      // Set headers for ZIP download
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="drop-${room.id}.zip"`);

      // Create ZIP archive
      const archive = archiver('zip', {
        zlib: { level: 9 },
      });

      // Pipe archive to response
      archive.pipe(res);

      // Add items to archive
      let textFileIndex = 1;
      let codeFileIndex = 1;

      for (const item of items) {
        if (item.type === 'text' && item.content) {
          archive.append(item.content, { name: `text-${textFileIndex++}.txt` });
        } else if (item.type === 'code' && item.content) {
          archive.append(item.content, { name: `code-${codeFileIndex++}.txt` });
        } else if (item.fileKey) {
          try {
            const fileBuffer = await storage.download(item.fileKey);
            archive.append(fileBuffer, { name: item.fileName || `file-${item.id}` });
          } catch (error) {
            // Skip files that can't be downloaded
            console.error(`Failed to download file: ${item.fileKey}`, error);
          }
        }
      }

      // Finalize archive
      await archive.finalize();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
