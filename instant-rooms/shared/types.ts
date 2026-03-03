export enum AccessMode {
  FULL_ACCESS = "full",
  READ_ONLY = "read_only",
  DROP_ONLY = "drop_only",
}

export enum ContentType {
  TEXT = "text",
  CODE = "code",
  IMAGE = "image",
  PDF = "pdf",
  FILE_BLOB = "file_blob",
}

export interface Room {
  code: string;
  accessMode: AccessMode;
  createdAt: string;
  expiresAt: string | null;
  isPinned: boolean;
  contentCount: number;
  lastActivity: string;
}

export interface ContentMetadata {
  size?: number;
  mimeType?: string;
  filename?: string;
  language?: string;
  pageCount?: number;
  width?: number;
  height?: number;
}

export interface ContentItem {
  id: string;
  roomCode: string;
  type: ContentType;
  title: string | null;
  content: string | null;
  fileId: string | null;
  fileUrl: string | null;
  metadata: ContentMetadata;
  createdAt: string;
  version: number;
  isDeleted: boolean;
}

export interface VersionSnapshot {
  roomCode: string;
  snapshotAt: string;
  contentState: ContentItem[];
  triggerEvent: string;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    retryable: boolean;
  };
  timestamp: string;
  requestId: string;
}

export interface CreateRoomRequest {
  expiryHours?: 1 | 24 | 168;
  accessMode?: AccessMode;
}

export interface CreateRoomResponse {
  room: Room;
}

export interface AddTextContentRequest {
  roomCode: string;
  type: ContentType.TEXT | ContentType.CODE;
  content: string;
  title?: string;
  language?: string;
}

export interface ContentListResponse {
  items: ContentItem[];
  total: number;
}

export interface HistoryResponse {
  snapshots: VersionSnapshot[];
}

export type ExpiryOption = 1 | 24 | 168;
