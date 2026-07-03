from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.wishlist import WishlistItem
from app.models.product import Product
from app.repositories.base import BaseRepository


class WishlistRepository(BaseRepository[WishlistItem]):
    def __init__(self, db: AsyncSession):
        super().__init__(WishlistItem, db)

    async def get_user_wishlist(self, user_id: str) -> List[WishlistItem]:
        result = await self.db.execute(
            select(WishlistItem)
            .options(
                selectinload(WishlistItem.product).selectinload(Product.images)
            )
            .where(WishlistItem.user_id == user_id)
            .order_by(WishlistItem.created_at.desc())
        )
        return list(result.scalars().unique().all())

    async def get_item(self, user_id: str, product_id: str) -> Optional[WishlistItem]:
        result = await self.db.execute(
            select(WishlistItem).where(
                WishlistItem.user_id == user_id,
                WishlistItem.product_id == product_id,
            )
        )
        return result.scalar_one_or_none()
