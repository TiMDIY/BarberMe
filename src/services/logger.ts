// BarberMe - Structured JSON Logger (Enterprise Observability)

export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export interface LogContext {
  traceId?: string;
  tenantId?: string;
  customerId?: string;
  route?: string;
  statusCode?: number;
  durationMs?: number;
  [key: string]: unknown;
}

export class Logger {
  private formatLog(level: LogLevel, message: string, context: LogContext = {}): string {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      service: 'barberme-api',
      message,
      ...context
    };
    return JSON.stringify(entry);
  }

  info(message: string, context?: LogContext): void {
    console.log(this.formatLog('INFO', message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatLog('WARN', message, context));
  }

  error(message: string, context?: LogContext): void {
    console.error(this.formatLog('ERROR', message, context));
  }
}

export const logger = new Logger();
