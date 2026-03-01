import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

/**
 * 에러 응답 인터페이스
 */
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
    details?: unknown;
    stack?: string;
  };
}

/**
 * 전역 에러 핸들러
 * API Route에서 발생한 모든 에러를 통일된 형식으로 변환
 *
 * @param error - 발생한 에러 객체
 * @returns NextResponse with standardized error format
 */
export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  // 개발 환경 여부 확인
  const isDevelopment = process.env.NODE_ENV === "development";

  // 에러 로깅
  logError(error);

  // 1. AppError (커스텀 에러)
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          statusCode: error.statusCode,
          details: error.details,
          ...(isDevelopment && { stack: error.stack }),
        },
      },
      { status: error.statusCode }
    );
  }

  // 2. Prisma 에러
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error, isDevelopment);
  }

  // 3. Zod Validation 에러
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "입력 데이터가 유효하지 않습니다",
          code: "VALIDATION_ERROR",
          statusCode: 422,
          details: error.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
          ...(isDevelopment && { stack: error.stack }),
        },
      },
      { status: 422 }
    );
  }

  // 4. Standard Error
  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || "서버 내부 오류가 발생했습니다",
          code: "INTERNAL_SERVER_ERROR",
          statusCode: 500,
          ...(isDevelopment && { stack: error.stack }),
        },
      },
      { status: 500 }
    );
  }

  // 5. Unknown 에러
  return NextResponse.json(
    {
      success: false,
      error: {
        message: "알 수 없는 오류가 발생했습니다",
        code: "UNKNOWN_ERROR",
        statusCode: 500,
        ...(isDevelopment && { details: error }),
      },
    },
    { status: 500 }
  );
}

/**
 * Prisma 에러 핸들러
 */
function handlePrismaError(
  error: Prisma.PrismaClientKnownRequestError,
  isDevelopment: boolean
): NextResponse<ErrorResponse> {
  switch (error.code) {
    // Unique constraint violation
    case "P2002": {
      const target = (error.meta?.target as string[]) || [];
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `이미 존재하는 ${target.join(", ")}입니다`,
            code: "DUPLICATE_ENTRY",
            statusCode: 409,
            details: { fields: target },
            ...(isDevelopment && { stack: error.stack }),
          },
        },
        { status: 409 }
      );
    }

    // Foreign key constraint violation
    case "P2003":
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "참조하는 데이터가 존재하지 않습니다",
            code: "FOREIGN_KEY_VIOLATION",
            statusCode: 400,
            ...(isDevelopment && { stack: error.stack }),
          },
        },
        { status: 400 }
      );

    // Record not found
    case "P2025":
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "요청한 리소스를 찾을 수 없습니다",
            code: "NOT_FOUND",
            statusCode: 404,
            ...(isDevelopment && { stack: error.stack }),
          },
        },
        { status: 404 }
      );

    // Required field missing
    case "P2011":
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "필수 필드가 누락되었습니다",
            code: "REQUIRED_FIELD_MISSING",
            statusCode: 400,
            ...(isDevelopment && { stack: error.stack }),
          },
        },
        { status: 400 }
      );

    // Database connection error
    case "P1001":
    case "P1002":
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "데이터베이스 연결에 실패했습니다",
            code: "DATABASE_CONNECTION_ERROR",
            statusCode: 503,
            ...(isDevelopment && { stack: error.stack }),
          },
        },
        { status: 503 }
      );

    default:
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "데이터베이스 오류가 발생했습니다",
            code: "DATABASE_ERROR",
            statusCode: 500,
            ...(isDevelopment && {
              details: { prismaCode: error.code },
              stack: error.stack,
            }),
          },
        },
        { status: 500 }
      );
  }
}

/**
 * 에러 로깅 함수
 */
function logError(error: unknown): void {
  const timestamp = new Date().toISOString();

  if (error instanceof AppError) {
    // 운영 에러 (예상 가능한 에러)는 INFO 레벨로 로깅
    if (error.isOperational) {
      console.info(`[${timestamp}] [OPERATIONAL ERROR]`, {
        name: error.name,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
      });
    } else {
      // 프로그래밍 에러 (예상 불가능한 에러)는 ERROR 레벨로 로깅
      console.error(`[${timestamp}] [PROGRAMMING ERROR]`, {
        name: error.name,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        stack: error.stack,
      });
    }
  } else if (error instanceof Error) {
    console.error(`[${timestamp}] [ERROR]`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  } else {
    console.error(`[${timestamp}] [UNKNOWN ERROR]`, error);
  }

  // TODO: 프로덕션 환경에서는 Sentry, LogRocket 등으로 전송
  // if (process.env.NODE_ENV === 'production' && !isOperational) {
  //   Sentry.captureException(error);
  // }
}

/**
 * async 함수를 래핑하여 에러를 자동으로 처리
 *
 * @example
 * export const GET = catchAsync(async (request) => {
 *   const data = await fetchData();
 *   return NextResponse.json({ data });
 * });
 */
export function catchAsync<T extends (...args: Parameters<T>) => Promise<NextResponse>>(
  fn: T
): (...args: Parameters<T>) => Promise<NextResponse> {
  return async (...args: Parameters<T>): Promise<NextResponse> => {
    try {
      return await fn(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Success Response Helper
 */
export function successResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status: statusCode }
  );
}
