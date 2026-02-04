"""
Seed initial tag data
"""
import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.tag import Tag, TagCategory


INITIAL_TAGS = [
    # VIEW 카테고리
    {"name": "논뷰맛집", "category": TagCategory.VIEW, "icon": "🌾", "color": "#8BC34A", "display_order": 1},
    {"name": "바다뷰", "category": TagCategory.VIEW, "icon": "🌊", "color": "#2196F3", "display_order": 2},
    {"name": "산뷰", "category": TagCategory.VIEW, "icon": "⛰️", "color": "#795548", "display_order": 3},
    {"name": "호수뷰", "category": TagCategory.VIEW, "icon": "🏞️", "color": "#00BCD4", "display_order": 4},

    # ACTIVITY 카테고리
    {"name": "불멍과별멍", "category": TagCategory.ACTIVITY, "icon": "🔥", "color": "#FF5722", "display_order": 5},
    {"name": "아궁이체험", "category": TagCategory.ACTIVITY, "icon": "🪵", "color": "#FF9800", "display_order": 6},
    {"name": "텃밭체험", "category": TagCategory.ACTIVITY, "icon": "🌱", "color": "#4CAF50", "display_order": 7},
    {"name": "낚시가능", "category": TagCategory.ACTIVITY, "icon": "🎣", "color": "#03A9F4", "display_order": 8},

    # FACILITY 카테고리
    {"name": "반려동물동반", "category": TagCategory.FACILITY, "icon": "🐕", "color": "#E91E63", "display_order": 9},
    {"name": "개별바베큐장", "category": TagCategory.FACILITY, "icon": "🍖", "color": "#F44336", "display_order": 10},
    {"name": "프라이빗풀", "category": TagCategory.FACILITY, "icon": "🏊", "color": "#00BCD4", "display_order": 11},
    {"name": "주차가능", "category": TagCategory.FACILITY, "icon": "🚗", "color": "#9E9E9E", "display_order": 12},

    # VIBE 카테고리
    {"name": "혼자오기좋은", "category": TagCategory.VIBE, "icon": "🧘", "color": "#9C27B0", "display_order": 13},
    {"name": "가족과함께", "category": TagCategory.VIBE, "icon": "👨‍👩‍👧‍👦", "color": "#FF9800", "display_order": 14},
    {"name": "친구와파티", "category": TagCategory.VIBE, "icon": "🎉", "color": "#E91E63", "display_order": 15},
    {"name": "조용한힐링", "category": TagCategory.VIBE, "icon": "🕊️", "color": "#607D8B", "display_order": 16},
]


async def seed_tags():
    """태그 초기 데이터 삽입"""
    async with AsyncSessionLocal() as session:
        for tag_data in INITIAL_TAGS:
            # 이미 존재하는지 확인
            result = await session.execute(
                select(Tag).where(Tag.name == tag_data["name"])
            )
            existing_tag = result.scalar_one_or_none()

            if not existing_tag:
                tag = Tag(**tag_data)
                session.add(tag)
                print(f"Added tag: {tag.name}")
            else:
                print(f"Tag already exists: {tag_data['name']}")

        await session.commit()
        print("Tag seeding completed!")


if __name__ == "__main__":
    asyncio.run(seed_tags())
