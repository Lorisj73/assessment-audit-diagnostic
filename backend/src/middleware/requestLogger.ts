import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

export const requestLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  const requestCount = logger.incrementRequestCount();

  // Stocke le start time dans res.locals pour y accéder dans les controllers
  res.locals.startTime = start;
  res.locals.requestCount = requestCount;

  logger.info(
    {
      route: req.path,
      method: req.method,
      requestCount,
    },
    `Handling ${req.method} ${req.path} request`
  );

  // Intercepte la réponse pour logger automatiquement
  const originalSend = res.send;
  res.send = function (data: any): Response {
    const duration = Date.now() - start;
    
    logger.logRequest(
      req.path,
      req.method,
      res.statusCode,
      duration
    ).catch((err) => {
      console.error("[ERROR] Failed to log request:", err);
    });

    logger.info(
      {
        route: req.path,
        method: req.method,
        status_code: res.statusCode,
        duration_ms: duration,
      },
      `${req.method} ${req.path} completed`
    );

    return originalSend.call(this, data);
  };

  next();
};
