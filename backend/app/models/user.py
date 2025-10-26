"""
User model for ChonCance
"""
from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.core.database import Base


class UserRole(str, enum.Enum):
    """User roles"""
    GUEST = "GUEST"  # 일반 여행객
    HOST_PENDING = "HOST_PENDING"  # 호스트 승인 대기
    HOST = "HOST"    # 호스트
    ADMIN = "ADMIN"  # 관리자


class HostStatus(str, enum.Enum):
    """Host approval status"""
    PENDING = "PENDING"     # 승인 대기
    APPROVED = "APPROVED"   # 승인 완료
    REJECTED = "REJECTED"   # 승인 거부


class User(Base):
    """User table model"""
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.GUEST, index=True)
    profile_image = Column(String, nullable=True)
    business_info = Column(String, nullable=True)
    is_host_approved = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self):
        return f"<User {self.email}>"


class HostProfile(Base):
    """Host profile table model"""
    __tablename__ = "host_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    business_number = Column(String(50), nullable=False)
    contact = Column(String(20), nullable=False)
    status = Column(SQLEnum(HostStatus), nullable=False, default=HostStatus.PENDING, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationship
    user = relationship("User", backref="host_profile")

    def __repr__(self):
        return f"<HostProfile user_id={self.user_id} status={self.status}>"
