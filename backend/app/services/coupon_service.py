from datetime import datetime, timezone
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.coupon import Coupon
from app.repositories.coupon_repository import CouponRepository
from app.schemas.coupon import CouponCreate, CouponResponse, CouponUpdate, CouponValidate


class CouponService:
    def __init__(self, db: AsyncSession):
        self.repo = CouponRepository(db)

    async def create(self, data: CouponCreate) -> CouponResponse:
        existing = await self.repo.get_by_code(data.code.upper())
        if existing:
            raise HTTPException(status_code=400, detail="Coupon code already exists")

        coupon = Coupon(
            code=data.code.upper(),
            description=data.description,
            discount_type=data.discount_type,
            discount_value=data.discount_value,
            min_order_amount=data.min_order_amount,
            max_discount_amount=data.max_discount_amount,
            usage_limit=data.usage_limit,
            is_active=data.is_active,
            starts_at=data.starts_at,
            expires_at=data.expires_at,
        )
        coupon = await self.repo.create(coupon)
        return CouponResponse.model_validate(coupon)

    async def get_all(self, skip: int = 0, limit: int = 20):
        coupons = await self.repo.get_all(skip=skip, limit=limit)
        total = await self.repo.count()
        return {
            "items": [CouponResponse.model_validate(c) for c in coupons],
            "total": total,
            "page": skip // limit + 1,
            "page_size": limit,
            "total_pages": (total + limit - 1) // limit,
        }

    async def update(self, coupon_id: str, data: CouponUpdate) -> CouponResponse:
        coupon = await self.repo.get_by_id(coupon_id)
        if not coupon:
            raise HTTPException(status_code=404, detail="Coupon not found")
        coupon = await self.repo.update(coupon, data.model_dump(exclude_unset=True))
        return CouponResponse.model_validate(coupon)

    async def delete(self, coupon_id: str) -> None:
        coupon = await self.repo.get_by_id(coupon_id)
        if not coupon:
            raise HTTPException(status_code=404, detail="Coupon not found")
        await self.repo.delete(coupon)

    async def validate_coupon(self, data: CouponValidate) -> dict:
        coupon = await self.repo.get_by_code(data.code.upper())
        if not coupon:
            raise HTTPException(status_code=404, detail="Invalid coupon code")
        if not coupon.is_active:
            raise HTTPException(status_code=400, detail="Coupon is inactive")

        now = datetime.now(timezone.utc)
        if now < coupon.starts_at.replace(tzinfo=timezone.utc):
            raise HTTPException(status_code=400, detail="Coupon not yet active")
        if now > coupon.expires_at.replace(tzinfo=timezone.utc):
            raise HTTPException(status_code=400, detail="Coupon has expired")
        if coupon.usage_limit and coupon.used_count >= coupon.usage_limit:
            raise HTTPException(status_code=400, detail="Coupon usage limit reached")
        if data.order_amount < coupon.min_order_amount:
            raise HTTPException(
                status_code=400,
                detail=f"Minimum order amount is {coupon.min_order_amount}",
            )

        if coupon.discount_type == "percentage":
            discount = data.order_amount * coupon.discount_value / 100
            if coupon.max_discount_amount:
                discount = min(discount, coupon.max_discount_amount)
        else:
            discount = coupon.discount_value

        return {
            "valid": True,
            "discount_amount": float(discount),
            "discount_type": coupon.discount_type,
            "discount_value": float(coupon.discount_value),
        }
