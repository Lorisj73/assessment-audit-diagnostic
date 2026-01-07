import { Request, Response } from "express";
import authService from "../services/AuthService";
import logger from "../config/logger";

export class AuthController {
  async login(req: Request, res: Response) {
    const start = Date.now();
    const requestCount = logger.incrementRequestCount();
    const route = "POST /auth/login";

    logger.info(
      { route, requestCount, email: req.body.email },
      "Handling POST /auth/login request"
    );

    try {
      const { email, password } = req.body;

      if (!email || !password) {
        const duration = Date.now() - start;
        await logger.logRequest("/auth/login", "POST", 400, duration, "Email and password are required");
        logger.warn(
          { route, duration_ms: duration },
          "POST /auth/login - validation failed: missing credentials"
        );
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      const result = await authService.login(email, password);

      if (!result) {
        const duration = Date.now() - start;
        await logger.logRequest("/auth/login", "POST", 401, duration, "Invalid credentials");
        logger.warn(
          { route, duration_ms: duration, email },
          "POST /auth/login - authentication failed: invalid credentials"
        );
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const duration = Date.now() - start;
      await logger.logRequest("/auth/login", "POST", 200, duration);
      logger.info(
        { route, duration_ms: duration, email, user_id: result.user.id },
        "POST /auth/login completed successfully"
      );

      res.json(result);
    } catch (error: any) {
      const duration = Date.now() - start;
      await logger.logRequest("/auth/login", "POST", 500, duration, error.message);
      logger.error(
        { route, duration_ms: duration, error: error.message },
        "POST /auth/login failed"
      );
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default new AuthController();
