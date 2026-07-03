from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.dependencies.auth import get_admin_user, get_current_user
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.review import ReviewCreate, ReviewResponse, ReviewUpdate
from app.services.review_service import ReviewService

router = APIRouter()


@router.get("/product/{product_id}")
async def get_product_reviews(
    product_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    service = ReviewService(db)
    return await service.get_product_reviews(product_id, page=page, page_size=page_size)


@router.post("/", response_model=ReviewResponse)
async def create_review(
    data: ReviewCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ReviewService(db)
    return await service.create_review(user.id, data)


@router.put("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: str,
    data: ReviewUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ReviewService(db)
    return await service.update_review(review_id, user.id, data)


@router.delete("/{review_id}", response_model=MessageResponse)
async def delete_review(
    review_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ReviewService(db)
    await service.delete_review(review_id, user_id=user.id)
    return MessageResponse(message="Review deleted")


@router.delete("/admin/{review_id}", response_model=MessageResponse)
async def admin_delete_review(
    review_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    service = ReviewService(db)
    await service.delete_review(review_id, is_admin=True)
    return MessageResponse(message="Review deleted")
