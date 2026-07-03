from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class CouponCreate(BaseModel):
    code: str = Field(..., min_length=3, max_length=50)
    description: Optional[str] = None
    discount_type: str = Field(..., pattern="^(percentage|fixed)$")
    discount_value: Decimal = Field(..., gt=0)
    min_order_amount: Decimal = Field(default=Decimal("0"))
    max_discount_amount: Optional[Decimal] = None
    usage_limit: Optional[int] = None
    is_active: bool = True
    starts_at: datetime
    expires_at: datetime


class CouponUpdate(BaseModel):
    description: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: Optional[Decimal] = None
    min_order_amount: Optional[Decimal] = None
    max_discount_amount: Optional[Decimal] = None
    usage_limit: Optional[int] = None
    is_active: Optional[bool] = None
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None


class CouponResponse(BaseModel):
    id: str
    code: str
    description: Optional[str]
    discount_type: str
    discount_value: Decimal
    min_order_amount: Decimal
    max_discount_amount: Optional[Decimal]
    usage_limit: Optional[int]
    used_count: int
    is_active: bool
    starts_at: datetime
    expires_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


class CouponValidate(BaseModel):
    code: str
    order_amount: Decimal
