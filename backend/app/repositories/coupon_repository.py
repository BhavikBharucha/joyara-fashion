from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.coupon import Coupon
from app.repositories.base import BaseRepository


class CouponRepository(BaseRepository[Coupon]):
    def __init__(self, db: AsyncSession):
        super().__init__(Coupon, db)

    async def get_by_code(self, code: str) -> Optional[Coupon]:
        result = await self.db.execute(
            select(Coupon).where(Coupon.code == code.upper())
        )
        return result.scalar_one_or_none()
