/**
 * Shared types between client and server
 * These types ensure consistency across the application
 */

export type ContentType = 'text' | 'code' | 'image' | 'pdf';

export interface Room {
  id: string;
  createdAt: string;
  expiresAt: string;
  itemCount?: number;
}

export interface RoomItem {
  id: string;
  roomId: string;
  type: ContentType;
  content?: string;
  fileKey?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface CreateRoomResponse {
  room: Room;
}

export interface GetRoomResponse {
  room: Room;
  items: RoomItem[];
}

export interface CreateItemRequest {
  type: ContentType;
  content?: string;
  fileName?: string;
  mimeType?: string;
}

export interface CreateItemResponse {
  item: RoomItem;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  itemId: string;
  fileKey: string;
}

export interface ExportFormat {
  format: 'zip' | 'markdown';
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// Storage configuration
export interface StorageConfig {
  type: 'local' | 's3';
  bucket?: string;
  region?: string;
  accessKey?: string;
  secretKey?: string;
  localPath?: string;
}

// File upload constraints
export const FILE_CONSTRAINTS = {
  MAX_FILE_SIZE: 52428800, // 50MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_PDF_TYPE: 'application/pdf',
  ALLOWED_TEXT_TYPES: ['text/plain', 'text/markdown', 'text/html'],
} as const;

// Room constraints
export const ROOM_CONSTRAINTS = {
  DEFAULT_TTL_DAYS: 7,
  MAX_ITEMS_PER_ROOM: 1000,
  ID_LENGTH: 12,
} as const;
