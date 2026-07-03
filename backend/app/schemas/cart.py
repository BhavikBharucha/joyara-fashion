from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.product import ProductListResponse


class CartItemCreate(BaseModel):
    product_id: str
    variant_id: Optional[str] = None
    size: Optional[str] = None
    color: Optional[str] = None
    quantity: int = Field(1, gt=0)


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., gt=0)


class CartItemResponse(BaseModel):
    id: str
    product_id: str
    variant_id: Optional[str]
    size: Optional[str]
    color: Optional[str]
    quantity: int
    product: Optional[ProductListResponse] = None
    created_at: datetime

    model_config = {"from_attributes": True}
