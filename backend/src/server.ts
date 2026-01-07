import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import taskRoutes from "./routes/tasks";
import dashboardRoutes from "./routes/dashboard";
import logger from "./config/logger";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de base
app.use(cors());
app.use(express.json());

// Middleware de logging pour toutes les requêtes
app.use((req, res, next) => {
  const start = Date.now();
  const requestCount = logger.incrementRequestCount();

  logger.info(
    {
      route: req.path,
      method: req.method,
      requestCount,
      query: req.query,
      body: req.method !== "GET" ? req.body : undefined,
    },
    `Handling ${req.method} ${req.path} request`
  );

  // Intercepte la fin de la réponse
  const originalSend = res.send;
  res.send = function (data: any): express.Response {
    const duration = Date.now() - start;

    // Log en base de données de manière asynchrone
    logger
      .logRequest(req.path, req.method, res.statusCode, duration)
      .catch((err) => {
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
});

// Routes
app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);
app.use("/dashboard", dashboardRoutes);

// Route de santé
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  logger.info({ port: PORT }, "TaskWatch server started successfully");
});

export default app;
