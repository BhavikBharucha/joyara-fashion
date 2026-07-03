from datetime import datetime

from pydantic import BaseModel

from app.schemas.product import ProductListResponse


class WishlistItemCreate(BaseModel):
    product_id: str


class WishlistItemResponse(BaseModel):
    id: str
    product_id: str
    product: ProductListResponse
    created_at: datetime

    model_config = {"from_attributes": True}
