import { Router, Request, Response } from "express";
import { contentService } from "../services/contentService";
import { roomService } from "../services/roomService";
import { exportService } from "../services/exportService";

const router = Router();

// POST /api/export/:roomCode/zip
router.post("/:roomCode/zip", async (req: Request, res: Response) => {
  const room = roomService.getRoom(req.params.roomCode);
  if (!room) {
    res.status(404).json({
      error: { code: "ROOM_NOT_FOUND", message: "Room not found.", retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }

  try {
    const items = contentService.getContentByRoom(req.params.roomCode);
    const buffer = await exportService.exportAsZip(req.params.roomCode, items);
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="room-${req.params.roomCode}.zip"`
    );
    res.send(buffer);
  } catch {
    res.status(500).json({
      error: { code: "EXPORT_FAILED", message: "Export failed.", retryable: true },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
  }
});

// POST /api/export/:roomCode/md
router.post("/:roomCode/md", (req: Request, res: Response) => {
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
  const markdown = exportService.exportAsMarkdown(req.params.roomCode, items);

  res.setHeader("Content-Type", "text/markdown");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="room-${req.params.roomCode}.md"`
  );
  res.send(markdown);
});

// POST /api/export/:roomCode/pdf
router.post("/:roomCode/pdf", async (req: Request, res: Response) => {
  const room = roomService.getRoom(req.params.roomCode);
  if (!room) {
    res.status(404).json({
      error: { code: "ROOM_NOT_FOUND", message: "Room not found.", retryable: false },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }

  try {
    const items = contentService.getContentByRoom(req.params.roomCode);
    const buffer = await exportService.exportAsPdf(req.params.roomCode, items);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="room-${req.params.roomCode}.pdf"`
    );
    res.send(buffer);
  } catch {
    res.status(500).json({
      error: { code: "EXPORT_FAILED", message: "PDF export failed.", retryable: true },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
  }
});

export default router;
