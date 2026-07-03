from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.banner import Banner
from app.repositories.base import BaseRepository


class BannerRepository(BaseRepository[Banner]):
    def __init__(self, db: AsyncSession):
        super().__init__(Banner, db)

    async def get_active_banners(self, position: str = "hero") -> List[Banner]:
        result = await self.db.execute(
            select(Banner)
            .where(Banner.is_active == True, Banner.position == position)
            .order_by(Banner.sort_order)
        )
        return list(result.scalars().all())
