from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.dependencies.auth import get_admin_user, get_current_user
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate
from app.services.order_service import OrderService

router = APIRouter()


@router.post("/", response_model=OrderResponse)
async def create_order(
    data: OrderCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = OrderService(db)
    return await service.create_order(user.id, data)


@router.get("/my-orders")
async def get_my_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = OrderService(db)
    return await service.get_user_orders(user.id, page=page, page_size=page_size)


@router.get("/all")
async def get_all_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    service = OrderService(db)
    return await service.get_all_orders(page=page, page_size=page_size, status=status)


@router.get("/{order_number}", response_model=OrderResponse)
async def get_order(
    order_number: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = OrderService(db)
    user_id = None if user.role == "admin" else user.id
    return await service.get_order(order_number, user_id=user_id)


@router.patch("/{order_number}/status", response_model=OrderResponse)
async def update_order_status(
    order_number: str,
    data: OrderStatusUpdate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    service = OrderService(db)
    return await service.update_status(order_number, data)


@router.post("/{order_number}/cancel", response_model=OrderResponse)
async def cancel_order(
    order_number: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = OrderService(db)
    return await service.cancel_order(order_number, user.id)
