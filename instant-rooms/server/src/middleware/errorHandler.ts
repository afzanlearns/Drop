import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(err.stack);
  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred.",
      retryable: true,
    },
    timestamp: new Date().toISOString(),
    requestId: crypto.randomUUID(),
  });
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "The requested resource was not found.",
      retryable: false,
    },
    timestamp: new Date().toISOString(),
    requestId: crypto.randomUUID(),
  });
}
