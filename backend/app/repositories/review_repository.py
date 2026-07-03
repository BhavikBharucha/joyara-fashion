from typing import List, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.review import Review
from app.repositories.base import BaseRepository


class ReviewRepository(BaseRepository[Review]):
    def __init__(self, db: AsyncSession):
        super().__init__(Review, db)

    async def get_product_reviews(
        self, product_id: str, skip: int = 0, limit: int = 20
    ) -> List[Review]:
        result = await self.db.execute(
            select(Review)
            .where(Review.product_id == product_id, Review.is_approved == True)
            .order_by(Review.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def count_product_reviews(self, product_id: str) -> int:
        return await self.count(
            filters=[Review.product_id == product_id, Review.is_approved == True]
        )

    async def get_user_review(self, user_id: str, product_id: str) -> Optional[Review]:
        result = await self.db.execute(
            select(Review).where(
                Review.user_id == user_id, Review.product_id == product_id
            )
        )
        return result.scalar_one_or_none()

    async def get_average_rating(self, product_id: str) -> float:
        result = await self.db.execute(
            select(func.avg(Review.rating)).where(
                Review.product_id == product_id, Review.is_approved == True
            )
        )
        return float(result.scalar() or 0)
