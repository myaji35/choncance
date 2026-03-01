import { NextRequest } from "next/server";
import { catchAsync, successResponse } from "@/lib/api/error-handler";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
  DatabaseError,
  InternalServerError,
} from "@/lib/errors";

/**
 * 에러 핸들링 테스트 API
 * 다양한 에러 시나리오를 테스트
 *
 * 사용법:
 * GET /api/test-errors?type=bad_request
 * GET /api/test-errors?type=unauthorized
 * GET /api/test-errors?type=not_found
 * GET /api/test-errors?type=validation
 * GET /api/test-errors?type=database
 * GET /api/test-errors?type=internal
 * GET /api/test-errors?type=unexpected
 * GET /api/test-errors (성공 케이스)
 */
export const GET = catchAsync(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const errorType = searchParams.get("type");

  switch (errorType) {
    case "bad_request":
      throw new BadRequestError(
        "잘못된 요청 파라미터입니다",
        "INVALID_PARAMETER",
        { providedType: errorType }
      );

    case "unauthorized":
      throw new UnauthorizedError("로그인이 필요한 서비스입니다");

    case "not_found":
      throw new NotFoundError(
        "요청한 리소스를 찾을 수 없습니다",
        "RESOURCE_NOT_FOUND"
      );

    case "validation":
      throw new ValidationError("입력 데이터가 유효하지 않습니다", "VALIDATION_FAILED", {
        fields: {
          email: "이메일 형식이 올바르지 않습니다",
          password: "비밀번호는 8자 이상이어야 합니다",
        },
      });

    case "database":
      throw new DatabaseError("데이터베이스 연결 오류가 발생했습니다");

    case "internal":
      throw new InternalServerError("서버 내부 오류가 발생했습니다");

    case "unexpected":
      // 예상치 못한 에러 (일반 Error)
      throw new Error("예상치 못한 에러가 발생했습니다");

    default:
      // 성공 케이스
      return successResponse(
        {
          message: "에러 핸들링 테스트 API입니다",
          availableTypes: [
            "bad_request",
            "unauthorized",
            "not_found",
            "validation",
            "database",
            "internal",
            "unexpected",
          ],
          usage: "?type=<error_type>을 추가하여 각 에러를 테스트할 수 있습니다",
        },
        "에러 핸들링 시스템이 정상 작동 중입니다"
      );
  }
});
