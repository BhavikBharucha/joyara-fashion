from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.wishlist import WishlistItemCreate
from app.services.wishlist_service import WishlistService

router = APIRouter()


@router.get("/")
async def get_wishlist(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = WishlistService(db)
    return await service.get_wishlist(user.id)


@router.post("/")
async def add_to_wishlist(
    data: WishlistItemCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = WishlistService(db)
    return await service.add_to_wishlist(user.id, data.product_id)


@router.delete("/{product_id}", response_model=MessageResponse)
async def remove_from_wishlist(
    product_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = WishlistService(db)
    await service.remove_from_wishlist(user.id, product_id)
    return MessageResponse(message="Removed from wishlist")
