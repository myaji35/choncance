/**
 * 커스텀 에러 클래스 정의
 * VINTEE 프로젝트의 모든 비즈니스 로직 에러를 분류
 */

/**
 * 기본 애플리케이션 에러
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string,
    details?: unknown
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this);
  }
}

/**
 * 인증 관련 에러 (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "인증이 필요합니다", code?: string, details?: unknown) {
    super(message, 401, true, code || "UNAUTHORIZED", details);
  }
}

/**
 * 권한 부족 에러 (403)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "접근 권한이 없습니다", code?: string, details?: unknown) {
    super(message, 403, true, code || "FORBIDDEN", details);
  }
}

/**
 * 리소스 찾을 수 없음 에러 (404)
 */
export class NotFoundError extends AppError {
  constructor(message: string = "요청한 리소스를 찾을 수 없습니다", code?: string, details?: unknown) {
    super(message, 404, true, code || "NOT_FOUND", details);
  }
}

/**
 * 잘못된 요청 에러 (400)
 */
export class BadRequestError extends AppError {
  constructor(message: string = "잘못된 요청입니다", code?: string, details?: unknown) {
    super(message, 400, true, code || "BAD_REQUEST", details);
  }
}

/**
 * 유효성 검사 실패 에러 (422)
 */
export class ValidationError extends AppError {
  constructor(message: string = "입력 데이터가 유효하지 않습니다", code?: string, details?: unknown) {
    super(message, 422, true, code || "VALIDATION_ERROR", details);
  }
}

/**
 * 충돌 에러 (409) - 이미 존재하는 리소스
 */
export class ConflictError extends AppError {
  constructor(message: string = "이미 존재하는 리소스입니다", code?: string, details?: unknown) {
    super(message, 409, true, code || "CONFLICT", details);
  }
}

/**
 * 결제 관련 에러 (402)
 */
export class PaymentError extends AppError {
  constructor(message: string = "결제 처리 중 오류가 발생했습니다", code?: string, details?: unknown) {
    super(message, 402, true, code || "PAYMENT_ERROR", details);
  }
}

/**
 * 예약 관련 에러 (409)
 */
export class BookingError extends AppError {
  constructor(message: string = "예약 처리 중 오류가 발생했습니다", code?: string, details?: unknown) {
    super(message, 409, true, code || "BOOKING_ERROR", details);
  }
}

/**
 * 데이터베이스 에러 (500)
 */
export class DatabaseError extends AppError {
  constructor(message: string = "데이터베이스 오류가 발생했습니다", code?: string, details?: unknown) {
    super(message, 500, true, code || "DATABASE_ERROR", details);
  }
}

/**
 * 외부 API 에러 (502)
 */
export class ExternalAPIError extends AppError {
  constructor(message: string = "외부 서비스 연동 중 오류가 발생했습니다", code?: string, details?: unknown) {
    super(message, 502, true, code || "EXTERNAL_API_ERROR", details);
  }
}

/**
 * Rate Limit 초과 에러 (429)
 */
export class RateLimitError extends AppError {
  constructor(message: string = "요청 횟수가 너무 많습니다. 잠시 후 다시 시도해주세요", code?: string, details?: unknown) {
    super(message, 429, true, code || "RATE_LIMIT_EXCEEDED", details);
  }
}

/**
 * 서버 내부 에러 (500)
 */
export class InternalServerError extends AppError {
  constructor(message: string = "서버 내부 오류가 발생했습니다", code?: string, details?: unknown) {
    super(message, 500, false, code || "INTERNAL_SERVER_ERROR", details);
  }
}

/**
 * 타임아웃 에러 (504)
 */
export class TimeoutError extends AppError {
  constructor(message: string = "요청 시간이 초과되었습니다", code?: string, details?: unknown) {
    super(message, 504, true, code || "TIMEOUT", details);
  }
}

/**
 * 서비스 일시 중단 에러 (503)
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = "서비스가 일시적으로 사용 불가능합니다", code?: string, details?: unknown) {
    super(message, 503, true, code || "SERVICE_UNAVAILABLE", details);
  }
}
