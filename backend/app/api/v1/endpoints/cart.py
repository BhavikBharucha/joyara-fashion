from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.cart import CartItemCreate, CartItemResponse, CartItemUpdate
from app.schemas.common import MessageResponse
from app.services.cart_service import CartService

router = APIRouter()


@router.get("/")
async def get_cart(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = CartService(db)
    return await service.get_cart(user.id)


@router.post("/", response_model=CartItemResponse)
async def add_to_cart(
    data: CartItemCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = CartService(db)
    return await service.add_to_cart(user.id, data)


@router.put("/{item_id}", response_model=CartItemResponse)
async def update_cart_item(
    item_id: str,
    data: CartItemUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = CartService(db)
    return await service.update_cart_item(user.id, item_id, data)


@router.delete("/{item_id}", response_model=MessageResponse)
async def remove_from_cart(
    item_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = CartService(db)
    await service.remove_from_cart(user.id, item_id)
    return MessageResponse(message="Item removed from cart")


@router.delete("/", response_model=MessageResponse)
async def clear_cart(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = CartService(db)
    await service.clear_cart(user.id)
    return MessageResponse(message="Cart cleared")
