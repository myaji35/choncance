"""
Pydantic schemas for User API
"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime
import re


class UserRegisterRequest(BaseModel):
    """회원가입 요청 스키마"""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    name: str = Field(..., min_length=2, max_length=50)
    phone: str = Field(..., pattern=r'^\d{3}-\d{4}-\d{4}$')
    agreed_to_terms: bool
    agreed_to_privacy: bool

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('비밀번호는 영문을 포함해야 합니다')
        if not re.search(r'\d', v):
            raise ValueError('비밀번호는 숫자를 포함해야 합니다')
        return v

    @field_validator('agreed_to_terms', 'agreed_to_privacy')
    @classmethod
    def validate_agreement(cls, v: bool) -> bool:
        if not v:
            raise ValueError('이용약관과 개인정보 처리방침에 동의해주세요')
        return v


class UserResponse(BaseModel):
    """사용자 정보 응답 스키마"""
    id: str
    email: str
    name: str
    phone: str
    role: str
    profile_image: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserRegisterResponse(BaseModel):
    """회원가입 성공 응답 스키마"""
    user: UserResponse
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 86400


class UserLoginRequest(BaseModel):
    """로그인 요청 스키마"""
    email: EmailStr
    password: str = Field(..., min_length=1)
    remember_me: bool = False

    class Config:
        json_schema_extra = {
            "example": {
                "email": "test@example.com",
                "password": "password123",
                "remember_me": False
            }
        }


class UserLoginResponse(BaseModel):
    """로그인 성공 응답 스키마"""
    user: UserResponse
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 86400
