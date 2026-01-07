import pool from "./database";

interface LogContext {
  route?: string;
  method?: string;
  duration_ms?: number;
  status_code?: number;
  error?: string;
  [key: string]: any;
}

export class Logger {
  private requestCount: number = 0;

  incrementRequestCount(): number {
    return ++this.requestCount;
  }

  getRequestCount(): number {
    return this.requestCount;
  }

  info(context: LogContext, message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[INFO] [${timestamp}] ${message}`, JSON.stringify(context));
  }

  error(context: LogContext, message: string): void {
    const timestamp = new Date().toISOString();
    console.error(`[ERROR] [${timestamp}] ${message}`, JSON.stringify(context));
  }

  warn(context: LogContext, message: string): void {
    const timestamp = new Date().toISOString();
    console.warn(`[WARN] [${timestamp}] ${message}`, JSON.stringify(context));
  }

  async logRequest(
    route: string,
    method: string,
    statusCode: number,
    durationMs: number,
    errorMessage?: string
  ): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO request_logs (route, method, status_code, duration_ms, error_message) 
         VALUES ($1, $2, $3, $4, $5)`,
        [route, method, statusCode, durationMs, errorMessage || null]
      );
    } catch (err) {
      console.error("[ERROR] Failed to insert request_log:", err);
    }
  }
}

export const logger = new Logger();
export default logger;
