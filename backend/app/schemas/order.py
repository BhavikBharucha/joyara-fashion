from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field


class OrderItemCreate(BaseModel):
    product_id: str
    size: Optional[str] = None
    color: Optional[str] = None
    quantity: int = Field(..., gt=0)


class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    shipping_address_id: str
    billing_address_id: Optional[str] = None
    payment_method: str = "cod"
    coupon_code: Optional[str] = None
    notes: Optional[str] = None


class OrderItemResponse(BaseModel):
    id: str
    product_id: Optional[str]
    product_name: str
    product_image: Optional[str]
    size: Optional[str]
    color: Optional[str]
    quantity: int
    unit_price: Decimal
    total_price: Decimal

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: str
    order_number: str
    status: str
    payment_status: str
    payment_method: Optional[str]
    subtotal: Decimal
    discount_amount: Decimal
    shipping_amount: Decimal
    tax_amount: Decimal
    total_amount: Decimal
    coupon_code: Optional[str]
    tracking_number: Optional[str]
    notes: Optional[str]
    items: List[OrderItemResponse] = []
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: str
    tracking_number: Optional[str] = None
