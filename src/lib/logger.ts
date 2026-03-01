/**
 * 애플리케이션 전역 로거
 * 개발/프로덕션 환경에서 다르게 동작
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage("debug", message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage("info", message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage("warn", message, context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      ...(error instanceof Error && {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: this.isDevelopment ? error.stack : undefined,
      }),
    };

    console.error(this.formatMessage("error", message, errorContext));

    // TODO: 프로덕션 환경에서는 외부 로깅 서비스로 전송
    // if (!this.isDevelopment) {
    //   this.sendToExternalService(message, errorContext);
    // }
  }

  // TODO: Sentry, LogRocket 등 외부 서비스 연동
  // private sendToExternalService(message: string, context: LogContext): void {
  //   // Sentry.captureMessage(message, { level: 'error', extra: context });
  // }
}

export const logger = new Logger();
