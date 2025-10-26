"""
Authentication router for user registration and login
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta
from app.core.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import (
    UserRegisterRequest,
    UserRegisterResponse,
    UserResponse,
    UserLoginRequest,
    UserLoginResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    ResetPasswordResponse
)
from app.utils.security import hash_password, create_access_token, verify_password, create_reset_token, verify_reset_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserRegisterResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserRegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    회원가입 엔드포인트

    사용자가 이메일, 비밀번호, 이름, 전화번호를 입력하여 회원가입을 진행합니다.

    Args:
        user_data: 회원가입 요청 데이터
        db: 데이터베이스 세션

    Returns:
        UserRegisterResponse: 생성된 사용자 정보 및 JWT 토큰

    Raises:
        HTTPException: 이메일이 이미 존재하는 경우 409 Conflict
    """
    # 1. 이메일 중복 확인
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": "EMAIL_ALREADY_EXISTS",
                "message": "이미 가입된 이메일입니다"
            }
        )

    # 2. 비밀번호 해싱
    hashed_password = hash_password(user_data.password)

    # 3. 사용자 생성
    new_user = User(
        email=user_data.email,
        password=hashed_password,
        name=user_data.name,
        phone=user_data.phone,
        role=UserRole.GUEST
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # 4. JWT 토큰 생성
    access_token = create_access_token(
        data={"sub": str(new_user.id), "email": new_user.email}
    )

    # 5. 응답 반환
    return UserRegisterResponse(
        user=UserResponse(
            id=str(new_user.id),
            email=new_user.email,
            name=new_user.name,
            phone=new_user.phone,
            role=new_user.role.value,
            profile_image=new_user.profile_image,
            created_at=new_user.created_at
        ),
        access_token=access_token,
        token_type="bearer",
        expires_in=86400
    )


@router.post("/login", response_model=UserLoginResponse, status_code=status.HTTP_200_OK)
async def login_user(
    user_data: UserLoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    로그인 엔드포인트

    사용자가 이메일과 비밀번호로 로그인합니다.

    Args:
        user_data: 로그인 요청 데이터
        db: 데이터베이스 세션

    Returns:
        UserLoginResponse: 사용자 정보 및 JWT 토큰

    Raises:
        HTTPException: 이메일/비밀번호가 일치하지 않는 경우 401 Unauthorized
    """
    # 1. 이메일로 사용자 조회
    result = await db.execute(select(User).where(User.email == user_data.email))
    user = result.scalar_one_or_none()

    # 2. 사용자가 없거나 비밀번호가 일치하지 않으면 동일한 에러 반환 (보안)
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "INVALID_CREDENTIALS",
                "message": "이메일 또는 비밀번호가 올바르지 않습니다"
            }
        )

    # 3. JWT 토큰 생성 (로그인 상태 유지 옵션 처리)
    if user_data.remember_me:
        # 30일 만료
        expires_delta = timedelta(days=30)
        expires_in = 30 * 24 * 60 * 60  # 2592000초
    else:
        # 24시간 만료 (기본값)
        expires_delta = None
        expires_in = 86400

    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=expires_delta
    )

    # 4. 응답 반환
    return UserLoginResponse(
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            name=user.name,
            phone=user.phone,
            role=user.role.value,
            profile_image=user.profile_image,
            created_at=user.created_at
        ),
        access_token=access_token,
        token_type="bearer",
        expires_in=expires_in
    )


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(
    request_data: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    비밀번호 재설정 이메일 발송

    보안상 이메일 존재 여부와 관계없이 동일한 응답 반환

    Args:
        request_data: 비밀번호 재설정 요청 데이터 (이메일)
        db: 데이터베이스 세션

    Returns:
        ForgotPasswordResponse: 재설정 링크 발송 완료 메시지
    """
    # 사용자 조회
    result = await db.execute(
        select(User).where(User.email == request_data.email)
    )
    user = result.scalar_one_or_none()

    if user:
        # 재설정 토큰 생성
        reset_token = create_reset_token(str(user.id))

        # TODO: 이메일 발송
        # 실제 프로덕션에서는 이메일 발송 서비스 사용
        # await send_password_reset_email(
        #     email=user.email,
        #     reset_token=reset_token
        # )

        # 개발 환경에서는 콘솔에 로그 출력
        print(f"Password reset token for {user.email}: {reset_token}")
        print(f"Reset URL: http://localhost:3000/reset-password?token={reset_token}")

    # 보안상 항상 동일한 응답 반환
    return ForgotPasswordResponse(
        message="비밀번호 재설정 링크가 이메일로 발송되었습니다"
    )


@router.post("/reset-password", response_model=ResetPasswordResponse)
async def reset_password(
    request_data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    비밀번호 재설정

    Args:
        request_data: 비밀번호 재설정 데이터 (토큰, 새 비밀번호)
        db: 데이터베이스 세션

    Returns:
        ResetPasswordResponse: 비밀번호 변경 완료 메시지

    Raises:
        HTTPException: 토큰이 유효하지 않거나 만료된 경우 400 Bad Request
    """
    # 토큰 검증
    user_id = verify_reset_token(request_data.token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "INVALID_TOKEN",
                "message": "재설정 링크가 만료되었거나 유효하지 않습니다"
            }
        )

    # 사용자 조회
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "USER_NOT_FOUND",
                "message": "사용자를 찾을 수 없습니다"
            }
        )

    # 비밀번호 변경
    user.password = hash_password(request_data.new_password)
    await db.commit()

    return ResetPasswordResponse(
        message="비밀번호가 성공적으로 변경되었습니다"
    )
