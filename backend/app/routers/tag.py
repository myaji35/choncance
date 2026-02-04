"""
Tag management router
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.core.database import get_db
from app.models.tag import Tag, TagCategory
from app.schemas.tag import TagListResponse, TagResponse

router = APIRouter(prefix="/tags", tags=["Tags"])


@router.get("", response_model=TagListResponse)
async def get_tags(
    category: Optional[str] = Query(None, description="카테고리 필터"),
    db: AsyncSession = Depends(get_db)
):
    """
    모든 태그 조회

    카테고리별로 필터링 가능
    """
    query = select(Tag).where(Tag.is_active == True).order_by(Tag.display_order, Tag.name)

    if category:
        query = query.where(Tag.category == category)

    result = await db.execute(query)
    tags = result.scalars().all()

    return TagListResponse(
        tags=[
            TagResponse(
                id=str(tag.id),
                name=tag.name,
                category=tag.category.value,
                icon=tag.icon,
                color=tag.color,
                description=tag.description,
                display_order=tag.display_order,
                created_at=tag.created_at
            )
            for tag in tags
        ]
    )
