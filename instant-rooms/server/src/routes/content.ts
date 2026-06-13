import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { z } from "zod";
import { ContentType } from "../../../shared/types";
import { contentService } from "../services/contentService";
import { roomService } from "../services/roomService";
import { uploadRateLimiter } from "../middleware/rateLimit";

const router = Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, _file, cb) => {
    cb(null, true); // Accept all types, treat unknown as file_blob
  },
});

const AddTextSchema = z.object({
  roomCode: z.string().min(1).max(20),
  type: z.enum(["text", "code"]),
  content: z.string().min(1).max(500000),
  title: z.string().max(200).optional(),
  language: z.string().max(50).optional(),
  uploaderName: z.string().max(100).optional(),
  itemExpiryHours: z.union([z.literal(1), z.literal(6), z.literal(24)]).optional(),
  tags: z.array(z.string()).optional(),
  note: z.string().max(1000).optional(),
});

const PinContentSchema = z.object({
  pinned: z.boolean(),
});

const UpdateTagsSchema = z.object({
  tags: z.array(z.string().max(30)).max(10),
});

/** Verify creator token for content-level operations */
function verifyCreatorForRoom(roomCode: string, token: string | undefined): boolean {
  if (!token) return false;
  return roomService.verifyCreator(roomCode, token);
}

// POST /api/content/text - add text or code block
router.post("/text", (req: Request, res: Response) => {
  const parsed = AddTextSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: parsed.error.message, retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }

  const { roomCode, type, content, title, language, uploaderName, itemExpiryHours, tags, note } = parsed.data;

  const room = roomService.getRoom(roomCode);
  if (!room) {
    res.status(404).json({
      error: { code: "ROOM_NOT_FOUND", message: "Room not found.", retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }

  let detectedLanguage = language;
  if (type === "code" && !language) {
    detectedLanguage = contentService.detectCodeLanguage(content) ?? undefined;
  }

  const itemExpiresAt = itemExpiryHours
    ? new Date(Date.now() + itemExpiryHours * 60 * 60 * 1000).toISOString()
    : undefined;

  const item = contentService.addTextContent(roomCode, {
    type: type as ContentType.TEXT | ContentType.CODE,
    content,
    title,
    language: detectedLanguage,
    uploaderName,
    itemExpiresAt,
    tags,
    note,
  });

  roomService.addContentId(roomCode, item.id);
  res.status(201).json({ item });
});

// POST /api/content/upload - upload file
router.post(
  "/upload",
  uploadRateLimiter,
  upload.single("file"),
  (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({
        error: { code: "NO_FILE", message: "No file provided.", retryable: false },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      });
      return;
    }

    const roomCode = req.body.roomCode as string;
    if (!roomCode) {
      res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "roomCode is required.", retryable: false },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      });
      return;
    }

    const room = roomService.getRoom(roomCode);
    if (!room) {
      res.status(404).json({
        error: { code: "ROOM_NOT_FOUND", message: "Room not found.", retryable: false },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      });
      return;
    }

    const uploaderName = req.body.uploaderName as string | undefined;
    const note = req.body.note as string | undefined;
    const itemExpiryHours = req.body.itemExpiryHours
    const itemExpiresAt =
      itemExpiryHours && [1, 6, 24].includes(itemExpiryHours)
        ? new Date(Date.now() + itemExpiryHours * 60 * 60 * 1000).toISOString()
        : undefined;

    let parsedTags: string[] | undefined;
    if (req.body.tags) {
      try {
        parsedTags = JSON.parse(req.body.tags);
      } catch (e) {
        // invalid JSON
      }
    }

    const fileId = crypto.randomUUID();
    const ext = path.extname(req.file.originalname);
    const filename = `${fileId}${ext}`;

    const serverBaseUrl = `${req.protocol}://${req.get("host")}`;
    const item = contentService.addFileContent(
      roomCode,
      req.file,
      filename,
      serverBaseUrl,
      uploaderName,
      itemExpiresAt,
      parsedTags,
      note
    );
    contentService.storeFileBuffer(filename, req.file.buffer, req.file.mimetype);
    roomService.addContentId(roomCode, item.id);

    res.status(201).json({ item });
  }
);

// GET /api/content/:roomCode - list timeline
router.get("/:roomCode", (req: Request, res: Response) => {
  const room = roomService.getRoom(req.params.roomCode);
  if (!room) {
    res.status(404).json({
      error: { code: "ROOM_NOT_FOUND", message: "Room not found.", retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }

  const items = contentService.getContentByRoom(req.params.roomCode);
  res.json({ items, total: items.length });
});

// PATCH /api/content/:contentId/pin - pin/unpin item (creator only)
router.patch("/:contentId/pin", (req: Request, res: Response) => {
  const parsed = PinContentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Invalid pin value.", retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }

  const item = contentService.getContent(req.params.contentId);
  if (!item) {
    res.status(404).json({
      error: { code: "CONTENT_NOT_FOUND", message: "Content not found.", retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }

  const token = req.headers["x-creator-token"] as string | undefined;
  if (!verifyCreatorForRoom(item.roomCode, token)) {
    res.status(403).json({
      error: { code: "FORBIDDEN", message: "Creator token required.", retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }

  const updated = contentService.pinContent(req.params.contentId, parsed.data.pinned);
  if (!updated) {
    res.status(404).json({
      error: { code: "CONTENT_NOT_FOUND", message: "Content not found.", retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }
  res.json({ item: updated });
});

// PATCH /api/content/:contentId/tags - update tags (anyone)
router.patch("/:contentId/tags", (req: Request, res: Response) => {
  const parsed = UpdateTagsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Invalid tags array.", retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }

  const item = contentService.getContent(req.params.contentId);
  if (!item) {
    res.status(404).json({
      error: { code: "CONTENT_NOT_FOUND", message: "Content not found.", retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }

  const updated = contentService.updateTags(req.params.contentId, parsed.data.tags);
  if (!updated) {
    res.status(404).json({
      error: { code: "CONTENT_NOT_FOUND", message: "Content not found.", retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }
  res.json({ item: updated });
});

// DELETE /api/content/:contentId - delete content item (creator only)
router.delete("/:contentId", (req: Request, res: Response) => {
  const item = contentService.getContent(req.params.contentId);
  if (!item) {
    res.status(404).json({
      error: { code: "CONTENT_NOT_FOUND", message: "Content not found.", retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }

  const token = req.headers["x-creator-token"] as string | undefined;
  if (!verifyCreatorForRoom(item.roomCode, token)) {
    res.status(403).json({
      error: { code: "FORBIDDEN", message: "Only the room creator can delete items.", retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }

  const deleted = contentService.deleteContent(req.params.contentId);
  if (!deleted) {
    res.status(404).json({
      error: { code: "CONTENT_NOT_FOUND", message: "Content not found.", retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }
  res.json({ success: true });
});

export default router;
