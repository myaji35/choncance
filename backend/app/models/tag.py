"""
Tag model for ChonCance
"""
from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum, Integer, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum
from app.core.database import Base


class TagCategory(str, enum.Enum):
    """Tag categories"""
    VIEW = "VIEW"           # 뷰/전망
    ACTIVITY = "ACTIVITY"   # 액티비티
    FACILITY = "FACILITY"   # 시설/편의
    VIBE = "VIBE"           # 분위기/감성


class Tag(Base):
    """Tag table model"""
    __tablename__ = "tags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(50), unique=True, nullable=False)
    category = Column(SQLEnum(TagCategory), nullable=False, index=True)
    icon = Column(String(10), nullable=True)
    color = Column(String(7), nullable=False)  # HEX color code
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self):
        return f"<Tag {self.name} ({self.category})>"


# PropertyTag will be created later when properties model is ready
# class PropertyTag(Base):
#     """Property-Tag association table"""
#     __tablename__ = "property_tags"
#
#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
#     property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"), nullable=False)
#     tag_id = Column(UUID(as_uuid=True), ForeignKey("tags.id"), nullable=False)
#     created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
#
#     def __repr__(self):
#         return f"<PropertyTag property_id={self.property_id} tag_id={self.tag_id}>"
