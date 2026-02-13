/**
 * File Upload Utility
 * Multer configuration for handling file uploads
 */

import multer from 'multer';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';

// File filter to validate MIME types
function fileFilter(req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    // PDFs
    'application/pdf',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`File type not allowed: ${file.mimetype}`, 400));
  }
}

// Multer configuration
export const upload = multer({
  storage: multer.memoryStorage(), // Store in memory as Buffer
  limits: {
    fileSize: config.limits.maxFileSize,
  },
  fileFilter,
});
