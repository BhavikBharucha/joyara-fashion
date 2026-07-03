from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.review import Review
from app.repositories.product_repository import ProductRepository
from app.repositories.review_repository import ReviewRepository
from app.schemas.review import ReviewCreate, ReviewResponse, ReviewUpdate


class ReviewService:
    def __init__(self, db: AsyncSession):
        self.repo = ReviewRepository(db)
        self.product_repo = ProductRepository(db)
        self.db = db

    async def create_review(self, user_id: str, data: ReviewCreate) -> ReviewResponse:
        product = await self.product_repo.get_by_id(data.product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        existing = await self.repo.get_user_review(user_id, data.product_id)
        if existing:
            raise HTTPException(status_code=400, detail="You already reviewed this product")

        review = Review(
            user_id=user_id,
            product_id=data.product_id,
            rating=data.rating,
            title=data.title,
            comment=data.comment,
        )
        review = await self.repo.create(review)

        avg_rating = await self.repo.get_average_rating(data.product_id)
        count = await self.repo.count_product_reviews(data.product_id)
        product.avg_rating = round(avg_rating, 2)
        product.review_count = count
        await self.db.flush()

        return ReviewResponse.model_validate(review)

    async def get_product_reviews(self, product_id: str, page: int = 1, page_size: int = 20):
        skip = (page - 1) * page_size
        reviews = await self.repo.get_product_reviews(product_id, skip=skip, limit=page_size)
        total = await self.repo.count_product_reviews(product_id)
        return {
            "items": [ReviewResponse.model_validate(r) for r in reviews],
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size,
        }

    async def update_review(self, review_id: str, user_id: str, data: ReviewUpdate) -> ReviewResponse:
        review = await self.repo.get_by_id(review_id)
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        if review.user_id != user_id:
            raise HTTPException(status_code=403, detail="Access denied")

        review = await self.repo.update(review, data.model_dump(exclude_unset=True))

        avg_rating = await self.repo.get_average_rating(review.product_id)
        product = await self.product_repo.get_by_id(review.product_id)
        if product:
            product.avg_rating = round(avg_rating, 2)
            await self.db.flush()

        return ReviewResponse.model_validate(review)

    async def delete_review(self, review_id: str, user_id: str = None, is_admin: bool = False) -> None:
        review = await self.repo.get_by_id(review_id)
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        if not is_admin and review.user_id != user_id:
            raise HTTPException(status_code=403, detail="Access denied")

        product_id = review.product_id
        await self.repo.delete(review)

        avg_rating = await self.repo.get_average_rating(product_id)
        count = await self.repo.count_product_reviews(product_id)
        product = await self.product_repo.get_by_id(product_id)
        if product:
            product.avg_rating = round(avg_rating, 2)
            product.review_count = count
            await self.db.flush()
