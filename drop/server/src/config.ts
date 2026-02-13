/**
 * Server Configuration
 * Loads and validates environment variables
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

interface Config {
  nodeEnv: string;
  port: number;
  corsOrigin: string;
  database: {
    url: string;
  };
  storage: {
    type: 'local' | 's3';
    s3?: {
      bucket: string;
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
      endpoint?: string;
    };
    local?: {
      path: string;
    };
  };
  limits: {
    maxFileSize: number;
    maxItemsPerRoom: number;
  };
  room: {
    ttlDays: number;
  };
  cleanup: {
    cron: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}

// Parse and validate configuration
const storageType = process.env.STORAGE_TYPE || 'local';

if (storageType !== 'local' && storageType !== 's3') {
  throw new Error('STORAGE_TYPE must be either "local" or "s3"');
}

export const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/drop',
  },
  
  storage: {
    type: storageType as 'local' | 's3',
    ...(storageType === 's3' && {
      s3: {
        bucket: process.env.S3_BUCKET || '',
        region: process.env.S3_REGION || 'us-east-1',
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        endpoint: process.env.S3_ENDPOINT,
      },
    }),
    ...(storageType === 'local' && {
      local: {
        path: process.env.LOCAL_STORAGE_PATH || path.join(process.cwd(), 'storage', 'uploads'),
      },
    }),
  },
  
  limits: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10), // 50MB
    maxItemsPerRoom: parseInt(process.env.MAX_ITEMS_PER_ROOM || '1000', 10),
  },
  
  room: {
    ttlDays: parseInt(process.env.ROOM_TTL_DAYS || '7', 10),
  },
  
  cleanup: {
    cron: process.env.CLEANUP_CRON || '0 * * * *', // Every hour
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
};

// Validate S3 configuration if using S3
if (config.storage.type === 's3') {
  const s3Config = config.storage.s3;
  if (!s3Config?.bucket || !s3Config?.accessKeyId || !s3Config?.secretAccessKey) {
    throw new Error('S3 configuration incomplete. Check S3_BUCKET, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY');
  }
}
