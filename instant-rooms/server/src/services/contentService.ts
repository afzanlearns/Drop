import { ContentItem, ContentType, VersionSnapshot } from "../../../shared/types";
import path from "path";
import fs from "fs";

const contentItems = new Map<string, ContentItem>();
const versionHistory = new Map<string, VersionSnapshot[]>();

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "application/zip",
  "application/x-zip-compressed",
]);

const IMAGE_MIMES = new Set(["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const contentService = {
  detectContentType(mimeType: string | undefined, filename: string | undefined): ContentType {
    if (!mimeType) return ContentType.FILE_BLOB;
    if (mimeType === "application/pdf") return ContentType.PDF;
    if (IMAGE_MIMES.has(mimeType)) return ContentType.IMAGE;
    if (mimeType.startsWith("text/")) return ContentType.TEXT;
    return ContentType.FILE_BLOB;
  },

  detectCodeLanguage(content: string): string | null {
    const patterns: [RegExp, string][] = [
      [/^\s*import\s+.+from\s+['"]|^\s*export\s+(default\s+)?(function|class|const)/m, "javascript"],
      [/^\s*(def |class |import |from .+ import |if __name__)/m, "python"],
      [/^\s*(public|private|protected|class|interface|enum)\s+/m, "java"],
      [/^\s*(<\?php|namespace\s+|use\s+\w+\\)/m, "php"],
      [/^\s*(fn |let |mut |use |mod |impl |pub |struct |enum )/m, "rust"],
      [/^\s*(func |package |import \(|type \w+ struct)/m, "go"],
      [/^\s*(<html|<!DOCTYPE|<div|<span|<head|<body)/im, "html"],
      [/^\s*(\.|#|\*)\s*\{|@media\s*\(/m, "css"],
      [/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\s+/im, "sql"],
      [/^\s*(#!\/bin\/(bash|sh)|echo |grep |awk |sed )/m, "bash"],
    ];
    for (const [pattern, lang] of patterns) {
      if (pattern.test(content)) return lang;
    }
    const braceCount = (content.match(/[{}]/g) ?? []).length;
    if (braceCount > 4) return "javascript";
    return null;
  },

  isCodeContent(content: string): boolean {
    return contentService.detectCodeLanguage(content) !== null;
  },

  validateFileSize(size: number): boolean {
    return size <= MAX_FILE_SIZE;
  },

  validateMimeType(mimeType: string): boolean {
    return ALLOWED_MIME_TYPES.has(mimeType) || mimeType.startsWith("text/") || mimeType.startsWith("image/");
  },

  addTextContent(
    roomCode: string,
    params: {
      type: ContentType.TEXT | ContentType.CODE;
      content: string;
      title?: string;
      language?: string;
      uploaderName?: string;
      itemExpiresAt?: string;
      tags?: string[];
    }
  ): ContentItem {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const autoTags = new Set(params.tags ?? []);
    autoTags.add(params.type);
    if (params.type === ContentType.CODE && params.language) {
      autoTags.add(params.language);
    }

    const item: ContentItem = {
      id,
      roomCode,
      type: params.type,
      title: params.title ?? null,
      content: params.content,
      fileId: null,
      fileUrl: null,
      metadata: params.language ? { language: params.language } : {},
      createdAt: now,
      version: 1,
      isDeleted: false,
      uploaderName: params.uploaderName ?? null,
      itemExpiresAt: params.itemExpiresAt ?? null,
      isPinned: false,
      tags: Array.from(autoTags).filter(Boolean),
    };

    contentItems.set(id, item);
    contentService.saveSnapshot(roomCode, "content_added");
    return item;
  },

  addFileContent(
    roomCode: string,
    file: Express.Multer.File,
    serverBaseUrl: string,
    uploaderName?: string,
    itemExpiresAt?: string,
    tags?: string[]
  ): ContentItem {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const mimeType = file.mimetype;
    const contentType = contentService.detectContentType(mimeType, file.originalname);

    const autoTags = new Set(tags ?? []);
    autoTags.add(contentType);
    const ext = path.extname(file.originalname).replace(".", "").toLowerCase();
    if (ext) autoTags.add(ext);

    const item: ContentItem = {
      id,
      roomCode,
      type: contentType,
      title: file.originalname,
      content: null,
      fileId: file.filename,
      fileUrl: `${serverBaseUrl}/uploads/${file.filename}`,
      metadata: {
        size: file.size,
        mimeType: file.mimetype,
        filename: file.originalname,
      },
      createdAt: now,
      version: 1,
      isDeleted: false,
      uploaderName: uploaderName ?? null,
      itemExpiresAt: itemExpiresAt ?? null,
      isPinned: false,
      tags: Array.from(autoTags).filter(Boolean),
    };

    contentItems.set(id, item);
    contentService.saveSnapshot(roomCode, "content_added");
    return item;
  },

  getContent(id: string): ContentItem | null {
    return contentItems.get(id) ?? null;
  },

  getContentByRoom(roomCode: string): ContentItem[] {
    const now = new Date().toISOString();
    return [...contentItems.values()]
      .filter((item) => {
        if (item.roomCode !== roomCode || item.isDeleted) return false;
        if (item.itemExpiresAt && item.itemExpiresAt < now) {
          item.isDeleted = true;
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Pinned items first, then by creation time
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
  },

  getAllContentByRoom(roomCode: string): ContentItem[] {
    return [...contentItems.values()]
      .filter((item) => item.roomCode === roomCode)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  deleteContent(id: string): boolean {
    const item = contentItems.get(id);
    if (!item) return false;
    item.isDeleted = true;
    contentService.saveSnapshot(item.roomCode, "content_deleted");
    return true;
  },

  pinContent(id: string, pinned: boolean): ContentItem | null {
    const item = contentItems.get(id);
    if (!item || item.isDeleted) return null;
    item.isPinned = pinned;
    contentService.saveSnapshot(item.roomCode, pinned ? "content_pinned" : "content_unpinned");
    return item;
  },

  updateTags(id: string, tags: string[]): ContentItem | null {
    const item = contentItems.get(id);
    if (!item || item.isDeleted) return null;
    item.tags = [...new Set(tags)];
    contentService.saveSnapshot(item.roomCode, "tags_updated");
    return item;
  },

  deleteFile(fileId: string): void {
    try {
      const uploadsDir = path.join(process.cwd(), "..", "uploads");
      const filePath = path.join(uploadsDir, fileId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // Non-critical
    }
  },

  deleteAllRoomContent(roomCode: string): void {
    for (const [id, item] of contentItems.entries()) {
      if (item.roomCode === roomCode) {
        if (item.fileId) contentService.deleteFile(item.fileId);
        contentItems.delete(id);
      }
    }
    versionHistory.delete(roomCode);
  },

  saveSnapshot(roomCode: string, trigger: string): void {
    const currentContent = contentService.getAllContentByRoom(roomCode);
    const snapshot: VersionSnapshot = {
      roomCode,
      snapshotAt: new Date().toISOString(),
      contentState: currentContent,
      triggerEvent: trigger,
    };

    const history = versionHistory.get(roomCode) ?? [];
    history.push(snapshot);
    if (history.length > 50) history.shift();
    versionHistory.set(roomCode, history);
  },

  getHistory(roomCode: string): VersionSnapshot[] {
    return versionHistory.get(roomCode) ?? [];
  },

  restoreToSnapshot(roomCode: string, snapshotAt: string): ContentItem[] | null {
    const history = versionHistory.get(roomCode);
    if (!history) return null;

    const snapshot = history.find((s) => s.snapshotAt === snapshotAt);
    if (!snapshot) return null;

    for (const [, item] of contentItems.entries()) {
      if (item.roomCode === roomCode) {
        item.isDeleted = true;
      }
    }

    for (const snapshotItem of snapshot.contentState) {
      const existing = contentItems.get(snapshotItem.id);
      if (existing) {
        existing.isDeleted = false;
      } else {
        contentItems.set(snapshotItem.id, { ...snapshotItem, isDeleted: false });
      }
    }

    contentService.saveSnapshot(roomCode, "state_restored");
    return contentService.getContentByRoom(roomCode);
  },
};
