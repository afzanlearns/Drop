import { Router, Request, Response } from "express";
import { z } from "zod";
import { AccessMode } from "../../../shared/types";
import { roomService } from "../services/roomService";
import { contentService } from "../services/contentService";

const router = Router();

const CreateRoomSchema = z.object({
  expiryHours: z.union([z.literal(1), z.literal(24), z.literal(168)]).optional().default(24),
  accessMode: z.nativeEnum(AccessMode).optional().default(AccessMode.FULL_ACCESS),
  name: z.string().max(100).optional(),
  customCode: z
    .string()
    .min(4)
    .max(12)
    .regex(/^[A-Za-z0-9]+$/, "Custom code must be alphanumeric only")
    .optional(),
});

const UpdateAccessSchema = z.object({
  accessMode: z.nativeEnum(AccessMode),
});

const UpdateExpirySchema = z.object({
  expiryHours: z.union([z.literal(1), z.literal(24), z.literal(168)]),
});

const PinSchema = z.object({
  pinned: z.boolean(),
});

const UpdateNameSchema = z.object({
  name: z.string().max(100),
});

/** Middleware: verify creator token from X-Creator-Token header */
function requireCreator(req: Request, res: Response, next: () => void): void {
  const token = req.headers["x-creator-token"] as string | undefined;
  const code = req.params.code?.toUpperCase();

  if (!token || !code) {
    res.status(403).json({
      error: { code: "FORBIDDEN", message: "Creator token required.", retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }

  if (!roomService.verifyCreator(code, token)) {
    res.status(403).json({
      error: { code: "FORBIDDEN", message: "Invalid creator token.", retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }

  next();
}

// POST /api/rooms - create room
router.post("/", (req: Request, res: Response) => {
  try {
    const parsed = CreateRoomSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: parsed.error.message, retryable: false },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      });
      return;
    }

    const { room, creatorToken } = roomService.createRoom(parsed.data);
    res.status(201).json({ room, creatorToken });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create room.";

    if (message.startsWith("ROOM_EXISTS:")) {
      const code = message.split(":")[1];
      res.status(409).json({
        error: {
          code: "ROOM_EXISTS",
          message: `A room with code ${code} already exists. Please choose a different code.`,
          retryable: false,
        },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      });
      return;
    }

    res.status(500).json({
      error: { code: "ROOM_CREATION_FAILED", message, retryable: true },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
  }
});

// GET /api/rooms/:code/exists - check if code is taken
router.get("/:code/exists", (req: Request, res: Response) => {
  const code = req.params.code?.toUpperCase();
  if (!code || code.length < 1) {
    res.json({ exists: false });
    return;
  }
  const exists = roomService.roomExists(code);
  res.json({ exists });
});

// GET /api/rooms/:code - get room
router.get("/:code", (req: Request, res: Response) => {
  const room = roomService.getRoom(req.params.code);
  if (!room) {
    res.status(404).json({
      error: { code: "ROOM_NOT_FOUND", message: "Room not found or has expired.", retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }
  res.json({ room });
});

// PATCH /api/rooms/:code/name - update room name (creator only)
router.patch("/:code/name", requireCreator, (req: Request, res: Response) => {
  const parsed = UpdateNameSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Invalid name.", retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }
  const room = roomService.updateName(req.params.code, parsed.data.name);
  if (!room) {
    res.status(404).json({
      error: { code: "ROOM_NOT_FOUND", message: "Room not found.", retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }
  res.json({ room });
});

// PATCH /api/rooms/:code/access - update access mode (creator only)
router.patch("/:code/access", requireCreator, (req: Request, res: Response) => {
  const parsed = UpdateAccessSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Invalid access mode.", retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }

  const room = roomService.updateAccessMode(req.params.code, parsed.data.accessMode);
  if (!room) {
    res.status(404).json({
      error: { code: "ROOM_NOT_FOUND", message: "Room not found.", retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }
  res.json({ room });
});

// PATCH /api/rooms/:code/expiry - update expiry (creator only)
router.patch("/:code/expiry", requireCreator, (req: Request, res: Response) => {
  const parsed = UpdateExpirySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Invalid expiry option.", retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }

  const room = roomService.updateExpiry(req.params.code, parsed.data.expiryHours);
  if (!room) {
    res.status(404).json({
      error: { code: "ROOM_NOT_FOUND", message: "Room not found.", retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }
  res.json({ room });
});

// PATCH /api/rooms/:code/pin - pin/unpin room (creator only)
router.patch("/:code/pin", requireCreator, (req: Request, res: Response) => {
  const parsed = PinSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Invalid pin value.", retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }

  const room = roomService.pinRoom(req.params.code, parsed.data.pinned);
  if (!room) {
    res.status(404).json({
      error: { code: "ROOM_NOT_FOUND", message: "Room not found.", retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }
  res.json({ room });
});

// GET /api/rooms/:code/history - version history
router.get("/:code/history", (req: Request, res: Response) => {
  const room = roomService.getRoom(req.params.code);
  if (!room) {
    res.status(404).json({
      error: { code: "ROOM_NOT_FOUND", message: "Room not found.", retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }

  const snapshots = contentService.getHistory(req.params.code);
  res.json({ snapshots });
});

// POST /api/rooms/:code/restore - restore to snapshot
router.post("/:code/restore", (req: Request, res: Response) => {
  const { snapshotAt } = req.body as { snapshotAt?: string };
  if (!snapshotAt) {
    res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "snapshotAt is required.", retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }

  const restored = contentService.restoreToSnapshot(req.params.code, snapshotAt);
  if (!restored) {
    res.status(404).json({
      error: { code: "SNAPSHOT_NOT_FOUND", message: "Snapshot not found.", retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }

  res.json({ items: restored, total: restored.length });
});

export default router;
