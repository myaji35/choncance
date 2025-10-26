"""
Pydantic schemas for Tag API
"""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class TagResponse(BaseModel):
    """태그 응답 스키마"""
    id: str
    name: str
    category: str
    icon: Optional[str] = None
    color: str
    description: Optional[str] = None
    display_order: int
    created_at: datetime

    class Config:
        from_attributes = True


class TagListResponse(BaseModel):
    """태그 목록 응답 스키마"""
    tags: List[TagResponse]


class PropertyTagsRequest(BaseModel):
    """숙소 태그 연결 요청 스키마"""
    tag_ids: List[str]

    class Config:
        json_schema_extra = {
            "example": {
                "tag_ids": ["uuid-1", "uuid-2", "uuid-3"]
            }
        }


class PropertyTagsResponse(BaseModel):
    """숙소 태그 연결 응답 스키마"""
    message: str
    property_id: str
    tags: List[TagResponse]
