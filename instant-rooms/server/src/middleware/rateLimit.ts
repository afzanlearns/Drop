import { Request, Response, NextFunction } from "express";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 200;

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress ?? "unknown";
}

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = getClientIp(req);
  const now = Date.now();

  let entry = store.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    store.set(ip, entry);
  }

  entry.count++;

  if (entry.count > MAX_REQUESTS) {
    res.status(429).json({
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Please try again later.",
        retryable: true,
      },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }

  next();
}

// Upload-specific stricter limiter
const uploadStore = new Map<string, RateLimitEntry>();
const UPLOAD_MAX = 30;

export function uploadRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = getClientIp(req);
  const now = Date.now();

  let entry = uploadStore.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    uploadStore.set(ip, entry);
  }

  entry.count++;

  if (entry.count > UPLOAD_MAX) {
    res.status(429).json({
      error: {
        code: "UPLOAD_RATE_LIMIT_EXCEEDED",
        message: "Upload limit exceeded. Please try again later.",
        retryable: true,
      },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    });
    return;
  }

  next();
}

// Cleanup old entries periodically (local dev only)
if (process.env.VERCEL !== "1") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) store.delete(key);
    }
    for (const [key, entry] of uploadStore.entries()) {
      if (now > entry.resetAt) uploadStore.delete(key);
    }
  }, 5 * 60 * 1000);
}
