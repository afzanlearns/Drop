/**
 * Storage Service
 * Abstraction layer for file storage (local or S3)
 */

import { config } from '../config';
import { LocalStorage } from './storage/local';
import { S3Storage } from './storage/s3';

export interface StorageService {
  upload(fileKey: string, buffer: Buffer, mimeType: string): Promise<void>;
  download(fileKey: string): Promise<Buffer>;
  delete(fileKey: string): Promise<void>;
  getSignedUrl(fileKey: string, expiresIn: number): Promise<string>;
  exists(fileKey: string): Promise<boolean>;
  listAll(prefix?: string): Promise<string[]>;
}

// Factory function to create appropriate storage service
function createStorageService(): StorageService {
  if (config.storage.type === 's3') {
    if (!config.storage.s3) {
      throw new Error('S3 configuration is missing');
    }
    return new S3Storage(config.storage.s3);
  } else {
    if (!config.storage.local) {
      throw new Error('Local storage configuration is missing');
    }
    return new LocalStorage(config.storage.local.path);
  }
}

// Export singleton instance
export const storage = createStorageService();
