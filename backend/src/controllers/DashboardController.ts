import { Request, Response } from "express";
import dashboardService from "../services/DashboardService";
import logger from "../config/logger";

export class DashboardController {
  async getSummary(req: Request, res: Response) {
    const start = Date.now();
    const requestCount = logger.incrementRequestCount();
    const route = "GET /dashboard/summary";

    logger.info({ route, requestCount }, "Handling GET /dashboard/summary request");

    try {
      const summary = await dashboardService.getSummary();
      
      const duration = Date.now() - start;
      await logger.logRequest("/dashboard/summary", "GET", 200, duration);
      logger.info(
        { route, duration_ms: duration, summary },
        "GET /dashboard/summary completed successfully"
      );

      res.json(summary);
    } catch (error: any) {
      const duration = Date.now() - start;
      await logger.logRequest("/dashboard/summary", "GET", 500, duration, error.message);
      logger.error(
        { route, duration_ms: duration, error: error.message },
        "GET /dashboard/summary failed"
      );
      console.error("Get dashboard summary error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default new DashboardController();
