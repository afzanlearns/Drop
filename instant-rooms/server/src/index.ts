import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { rateLimiter } from "./middleware/rateLimit";
import { errorHandler, notFound } from "./middleware/errorHandler";
import roomsRouter from "./routes/rooms";
import contentRouter from "./routes/content";
import exportRouter from "./routes/export";
import { roomService } from "./services/roomService";
import { contentService } from "./services/contentService";

const app = express();
const PORT = process.env.PORT ?? 4000;
const isServerless = process.env.VERCEL === "1";

// Ensure uploads directory exists (local dev only — Vercel FS is read-only)
if (!isServerless) {
  const uploadsDir = path.join(process.cwd(), "..", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use("/uploads", express.static(uploadsDir));
}

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(rateLimiter);

// Serve uploaded files from in-memory buffer on Vercel, or disk in local dev
if (isServerless) {
  app.get("/uploads/:fileId", (req, res) => {
    const file = contentService.getFileBuffer(req.params.fileId);
    if (!file) {
      res.status(404).json({
        error: { code: "FILE_NOT_FOUND", message: "File not found.", retryable: false },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      });
      return;
    }
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.send(file.buffer);
  });
}

// Routes
app.use("/api/rooms", roomsRouter);
app.use("/api/content", contentRouter);
app.use("/api/export", exportRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Background cleanup & HTTP listener (local dev only — Vercel uses its own runtime)
if (!isServerless) {
  setInterval(() => {
    const expired = roomService.cleanupExpiredRooms();
    if (expired.length > 0) {
      for (const code of expired) {
        contentService.deleteAllRoomContent(code);
      }
      console.log(`Cleaned up ${expired.length} expired room(s): ${expired.join(", ")}`);
    }
  }, 5 * 60 * 1000);

  app.listen(PORT, () => {
    console.log(`Instant Rooms server running on http://localhost:${PORT}`);
  });
}

export default app;
