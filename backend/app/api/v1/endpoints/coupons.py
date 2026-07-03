from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.dependencies.auth import get_admin_user, get_current_user
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.coupon import CouponCreate, CouponResponse, CouponUpdate, CouponValidate
from app.services.coupon_service import CouponService

router = APIRouter()


@router.get("/")
async def get_coupons(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    service = CouponService(db)
    skip = (page - 1) * page_size
    return await service.get_all(skip=skip, limit=page_size)


@router.post("/", response_model=CouponResponse)
async def create_coupon(
    data: CouponCreate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    service = CouponService(db)
    return await service.create(data)


@router.put("/{coupon_id}", response_model=CouponResponse)
async def update_coupon(
    coupon_id: str,
    data: CouponUpdate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    service = CouponService(db)
    return await service.update(coupon_id, data)


@router.delete("/{coupon_id}", response_model=MessageResponse)
async def delete_coupon(
    coupon_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    service = CouponService(db)
    await service.delete(coupon_id)
    return MessageResponse(message="Coupon deleted")


@router.post("/validate")
async def validate_coupon(
    data: CouponValidate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = CouponService(db)
    return await service.validate_coupon(data)
