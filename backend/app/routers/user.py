"""
User profile management router
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pathlib import Path
import uuid
import os

from app.core.database import get_db
from app.models.user import User, HostProfile, UserRole, HostStatus
from app.schemas.user import (
    UserResponse,
    UserProfileUpdateRequest,
    UserProfilePhotoUploadResponse,
    HostRequestRequest,
    HostRequestResponse
)
from app.utils.deps import get_current_user

router = APIRouter(prefix="/user", tags=["User Profile"])


@router.get("/profile", response_model=UserResponse)
async def get_profile(
    current_user: User = Depends(get_current_user)
):
    """
    현재 사용자 프로필 조회
    """
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
        phone=current_user.phone,
        role=current_user.role.value,
        profile_image=current_user.profile_image,
        created_at=current_user.created_at
    )


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_data: UserProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    프로필 정보 수정
    """
    # 프로필 업데이트
    current_user.name = profile_data.name
    current_user.phone = profile_data.phone

    await db.commit()
    await db.refresh(current_user)

    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
        phone=current_user.phone,
        role=current_user.role.value,
        profile_image=current_user.profile_image,
        created_at=current_user.created_at
    )


@router.post("/profile/upload-photo", response_model=UserProfilePhotoUploadResponse)
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    프로필 사진 업로드
    """
    # 파일 확장자 검증
    allowed_extensions = {".jpg", ".jpeg", ".png", ".webp"}
    file_extension = Path(file.filename).suffix.lower() if file.filename else ""

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "INVALID_FILE_TYPE",
                "message": "지원하지 않는 파일 형식입니다. (jpg, png, webp만 가능)"
            }
        )

    # 파일 크기 검증 (5MB)
    max_size = 5 * 1024 * 1024  # 5MB
    file_content = await file.read()

    if len(file_content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "FILE_TOO_LARGE",
                "message": "파일 크기는 5MB를 초과할 수 없습니다"
            }
        )

    # 파일명 생성 (user_id + extension)
    filename = f"{current_user.id}{file_extension}"

    # 저장 경로
    upload_dir = Path("public/uploads/profiles")
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_path = upload_dir / filename

    # 파일 저장
    with open(file_path, "wb") as f:
        f.write(file_content)

    # DB 업데이트 (URL 저장)
    profile_image_url = f"/uploads/profiles/{filename}"
    current_user.profile_image = profile_image_url

    await db.commit()

    return UserProfilePhotoUploadResponse(profile_image=profile_image_url)


@router.post("/request-host", response_model=HostRequestResponse)
async def request_host(
    host_data: HostRequestRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    호스트 계정 신청

    일반 사용자가 호스트로 전환하기 위해 신청하는 API입니다.
    """
    # 이미 호스트이거나 신청 중인지 확인
    if current_user.role in [UserRole.HOST, UserRole.HOST_PENDING]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "ALREADY_HOST_OR_PENDING",
                "message": "이미 호스트이거나 승인 대기 중입니다."
            }
        )

    # 기존 HostProfile이 있는지 확인
    result = await db.execute(
        select(HostProfile).where(HostProfile.user_id == current_user.id)
    )
    existing_profile = result.scalar_one_or_none()

    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "HOST_PROFILE_EXISTS",
                "message": "이미 호스트 프로필이 존재합니다."
            }
        )

    # HostProfile 생성
    host_profile = HostProfile(
        user_id=current_user.id,
        business_number=host_data.business_number,
        contact=host_data.contact,
        status=HostStatus.PENDING
    )
    db.add(host_profile)

    # 사용자 역할을 HOST_PENDING으로 변경
    current_user.role = UserRole.HOST_PENDING

    await db.commit()
    await db.refresh(host_profile)

    # TODO: 관리자에게 알림 전송 (이메일, DB 알림 등)
    # await send_admin_notification(current_user, host_profile)

    return HostRequestResponse(
        message="호스트 계정 신청이 완료되었습니다. 관리자 승인 후 호스트 활동을 시작할 수 있습니다.",
        status=host_profile.status.value
    )
