import { Router, Request, Response } from "express";
import { z } from "zod";
import { AccessMode } from "../../../shared/types";
import { roomService } from "../services/roomService";
import { contentService } from "../services/contentService";

const router = Router();

const CreateRoomSchema = z.object({
  expiryHours: z.union([z.literal(1), z.literal(24), z.literal(168)]).optional().default(24),
  accessMode: z.nativeEnum(AccessMode).optional().default(AccessMode.FULL_ACCESS),
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

    const room = roomService.createRoom(parsed.data);
    res.status(201).json({ room });
  } catch (err) {
    res.status(500).json({
      error: { code: "ROOM_CREATION_FAILED", message: "Could not create room.", retryable: true },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
  }
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

// PATCH /api/rooms/:code/access - update access mode
router.patch("/:code/access", (req: Request, res: Response) => {
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

// PATCH /api/rooms/:code/expiry - update expiry
router.patch("/:code/expiry", (req: Request, res: Response) => {
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

// PATCH /api/rooms/:code/pin - pin/unpin room
router.patch("/:code/pin", (req: Request, res: Response) => {
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
