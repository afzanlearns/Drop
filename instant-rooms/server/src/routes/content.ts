import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { z } from "zod";
import { ContentType } from "../../../shared/types";
import { contentService } from "../services/contentService";
import { roomService } from "../services/roomService";
import { uploadRateLimiter } from "../middleware/rateLimit";

const router = Router();

const uploadsDir = path.join(process.cwd(), "..", "uploads");

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => {
    const uniqueSuffix = crypto.randomUUID();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (contentService.validateMimeType(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, true); // Accept all types, treat unknown as file_blob
    }
  },
});

const AddTextSchema = z.object({
  roomCode: z.string().min(1).max(20),
  type: z.enum(["text", "code"]),
  content: z.string().min(1).max(500000),
  title: z.string().max(200).optional(),
  language: z.string().max(50).optional(),
});

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

  const { roomCode, type, content, title, language } = parsed.data;

  const room = roomService.getRoom(roomCode);
  if (!room) {
    res.status(404).json({
      error: { code: "ROOM_NOT_FOUND", message: "Room not found.", retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }

  // Detect language if code and not provided
  let detectedLanguage = language;
  if (type === "code" && !language) {
    detectedLanguage = contentService.detectCodeLanguage(content) ?? undefined;
  }

  const item = contentService.addTextContent(roomCode, {
    type: type as ContentType.TEXT | ContentType.CODE,
    content,
    title,
    language: detectedLanguage,
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

    const serverBaseUrl = `${req.protocol}://${req.get("host")}`;
    const item = contentService.addFileContent(roomCode, req.file, serverBaseUrl);
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

// DELETE /api/content/:contentId - delete content item
router.delete("/:contentId", (req: Request, res: Response) => {
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
