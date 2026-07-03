from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.category import Category
from app.repositories.base import BaseRepository


class CategoryRepository(BaseRepository[Category]):
    def __init__(self, db: AsyncSession):
        super().__init__(Category, db)

    async def get_by_slug(self, slug: str) -> Optional[Category]:
        result = await self.db.execute(select(Category).where(Category.slug == slug))
        return result.scalar_one_or_none()

    async def get_active_categories(self) -> List[Category]:
        result = await self.db.execute(
            select(Category)
            .where(Category.is_active == True, Category.parent_id == None)
            .order_by(Category.sort_order)
        )
        return list(result.scalars().all())

    async def get_with_subcategories(self, category_id: str) -> Optional[Category]:
        result = await self.db.execute(
            select(Category)
            .options(selectinload(Category.subcategories))
            .where(Category.id == category_id)
        )
        return result.scalar_one_or_none()

    async def get_featured(self) -> List[Category]:
        result = await self.db.execute(
            select(Category)
            .where(Category.is_active == True, Category.is_featured == True)
            .order_by(Category.sort_order)
        )
        return list(result.scalars().all())
