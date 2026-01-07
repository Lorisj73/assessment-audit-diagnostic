import { Request, Response } from "express";
import taskService from "../services/TaskService";
import { TaskStatus } from "../models/Task";
import logger from "../config/logger";

export class TaskController {
  async getTasks(req: Request, res: Response) {
    const start = Date.now();
    const requestCount = logger.incrementRequestCount();
    const route = "GET /tasks";

    logger.info({ route, requestCount, filters: req.query }, "Handling GET /tasks request");

    try {
      const { status, search } = req.query;

      const filters: any = {};

      if (status) {
        filters.status = status as TaskStatus;
      }

      if (search) {
        filters.search = search as string;
      }

      const tasks = await taskService.getTasks(filters);
      const duration = Date.now() - start;

      await logger.logRequest("/tasks", "GET", 200, duration);
      logger.info(
        { route, duration_ms: duration, tasks_count: tasks.length },
        "GET /tasks completed successfully"
      );

      res.json(tasks);
    } catch (error: any) {
      const duration = Date.now() - start;
      await logger.logRequest("/tasks", "GET", 500, duration, error.message);
      logger.error(
        { route, duration_ms: duration, error: error.message },
        "GET /tasks failed"
      );
      console.error("Get tasks error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createTask(req: Request, res: Response) {
    const start = Date.now();
    const requestCount = logger.incrementRequestCount();
    const route = "POST /tasks";

    logger.info({ route, requestCount, body: req.body }, "Handling POST /tasks request");

    try {
      const { name, description, status } = req.body;

      if (!name || name.trim().length === 0) {
        const duration = Date.now() - start;
        await logger.logRequest("/tasks", "POST", 400, duration, "Task name is required");
        logger.warn({ route, duration_ms: duration }, "POST /tasks - validation failed: name required");
        return res.status(400).json({ error: "Task name is required" });
      }

      if (name.length > 200) {
        const duration = Date.now() - start;
        await logger.logRequest("/tasks", "POST", 400, duration, "Task name is too long");
        logger.warn({ route, duration_ms: duration }, "POST /tasks - validation failed: name too long");
        return res.status(400).json({ error: "Task name is too long" });
      }

      // Validation du statut
      const validStatuses: TaskStatus[] = ["todo", "in_progress", "done"];
      if (status && !validStatuses.includes(status)) {
        const duration = Date.now() - start;
        await logger.logRequest("/tasks", "POST", 400, duration, "Invalid status");
        logger.warn({ route, duration_ms: duration }, "POST /tasks - validation failed: invalid status");
        return res.status(400).json({ error: "Invalid status" });
      }

      // On utilise un user_id hardcodé pour simplifier (pas de vraie auth)
      const task = await taskService.createTask({
        user_id: 1,
        name: name.trim(),
        description: description || "",
        status: status || "todo",
      });

      const duration = Date.now() - start;
      await logger.logRequest("/tasks", "POST", 201, duration);
      logger.info(
        { route, duration_ms: duration, task_id: task.id },
        "POST /tasks completed successfully"
      );

      res.status(201).json(task);
    } catch (error: any) {
      const duration = Date.now() - start;
      await logger.logRequest("/tasks", "POST", 500, duration, error.message);
      logger.error(
        { route, duration_ms: duration, error: error.message },
        "POST /tasks failed"
      );
      console.error("Create task error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateTaskStatus(req: Request, res: Response) {
    const start = Date.now();
    const requestCount = logger.incrementRequestCount();
    const route = `PATCH /tasks/${req.params.id}/status`;

    logger.info(
      { route, requestCount, task_id: req.params.id, body: req.body },
      "Handling PATCH /tasks/:id/status request"
    );

    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        const duration = Date.now() - start;
        await logger.logRequest(`/tasks/${id}/status`, "PATCH", 400, duration, "Status is required");
        logger.warn({ route, duration_ms: duration }, "PATCH /tasks/:id/status - validation failed: status required");
        return res.status(400).json({ error: "Status is required" });
      }

      const validStatuses: TaskStatus[] = ["todo", "in_progress", "done"];
      if (!validStatuses.includes(status)) {
        const duration = Date.now() - start;
        await logger.logRequest(`/tasks/${id}/status`, "PATCH", 400, duration, "Invalid status");
        logger.warn({ route, duration_ms: duration }, "PATCH /tasks/:id/status - validation failed: invalid status");
        return res.status(400).json({ error: "Invalid status" });
      }

      const task = await taskService.updateTaskStatus(parseInt(id), status);

      if (!task) {
        const duration = Date.now() - start;
        await logger.logRequest(`/tasks/${id}/status`, "PATCH", 404, duration, "Task not found");
        logger.warn({ route, duration_ms: duration }, "PATCH /tasks/:id/status - task not found");
        return res.status(404).json({ error: "Task not found" });
      }

      const duration = Date.now() - start;
      await logger.logRequest(`/tasks/${id}/status`, "PATCH", 200, duration);
      logger.info(
        { route, duration_ms: duration, task_id: id, new_status: status },
        "PATCH /tasks/:id/status completed successfully"
      );

      res.json(task);
    } catch (error: any) {
      const duration = Date.now() - start;
      await logger.logRequest(`/tasks/${req.params.id}/status`, "PATCH", 500, duration, error.message);
      logger.error(
        { route, duration_ms: duration, error: error.message },
        "PATCH /tasks/:id/status failed"
      );
      console.error("Update task status error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async startTimer(req: Request, res: Response) {
    const start = Date.now();
    const requestCount = logger.incrementRequestCount();
    const route = `POST /tasks/${req.params.id}/start`;

    logger.info(
      { route, requestCount, task_id: req.params.id },
      "Handling POST /tasks/:id/start request"
    );

    try {
      const { id } = req.params;
      const task = await taskService.startTaskTimer(parseInt(id));
      
      const duration = Date.now() - start;
      await logger.logRequest(`/tasks/${id}/start`, "POST", 200, duration);
      logger.info(
        { route, duration_ms: duration, task_id: id },
        "POST /tasks/:id/start completed successfully"
      );

      res.json(task);
    } catch (error: any) {
      const duration = Date.now() - start;
      
      if (error.message === "Task not found") {
        await logger.logRequest(`/tasks/${req.params.id}/start`, "POST", 404, duration, error.message);
        logger.warn(
          { route, duration_ms: duration, error: error.message },
          "POST /tasks/:id/start - task not found"
        );
        return res.status(404).json({ error: error.message });
      }
      
      if (error.message === "Timer already running") {
        await logger.logRequest(`/tasks/${req.params.id}/start`, "POST", 400, duration, error.message);
        logger.warn(
          { route, duration_ms: duration, error: error.message },
          "POST /tasks/:id/start - timer already running"
        );
        return res.status(400).json({ error: error.message });
      }

      await logger.logRequest(`/tasks/${req.params.id}/start`, "POST", 500, duration, error.message);
      logger.error(
        { route, duration_ms: duration, error: error.message },
        "POST /tasks/:id/start failed"
      );
      console.error("Start timer error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async stopTimer(req: Request, res: Response) {
    const start = Date.now();
    const requestCount = logger.incrementRequestCount();
    const route = `POST /tasks/${req.params.id}/stop`;

    logger.info(
      { route, requestCount, task_id: req.params.id },
      "Handling POST /tasks/:id/stop request"
    );

    try {
      const { id } = req.params;
      const task = await taskService.stopTaskTimer(parseInt(id));
      
      const duration = Date.now() - start;
      await logger.logRequest(`/tasks/${id}/stop`, "POST", 200, duration);
      logger.info(
        { route, duration_ms: duration, task_id: id, time_logged: task.time_logged },
        "POST /tasks/:id/stop completed successfully"
      );

      res.json(task);
    } catch (error: any) {
      const duration = Date.now() - start;
      
      if (error.message === "Task not found") {
        await logger.logRequest(`/tasks/${req.params.id}/stop`, "POST", 404, duration, error.message);
        logger.warn(
          { route, duration_ms: duration, error: error.message },
          "POST /tasks/:id/stop - task not found"
        );
        return res.status(404).json({ error: error.message });
      }
      
      if (error.message === "Timer not running") {
        await logger.logRequest(`/tasks/${req.params.id}/stop`, "POST", 400, duration, error.message);
        logger.warn(
          { route, duration_ms: duration, error: error.message },
          "POST /tasks/:id/stop - timer not running"
        );
        return res.status(400).json({ error: error.message });
      }

      await logger.logRequest(`/tasks/${req.params.id}/stop`, "POST", 500, duration, error.message);
      logger.error(
        { route, duration_ms: duration, error: error.message },
        "POST /tasks/:id/stop failed"
      );
      console.error("Stop timer error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default new TaskController();
