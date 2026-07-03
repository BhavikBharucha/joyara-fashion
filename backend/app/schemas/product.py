from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field


class ProductImageResponse(BaseModel):
    id: str
    image_url: str
    alt_text: Optional[str] = None
    is_primary: bool
    sort_order: int

    model_config = {"from_attributes": True}


class ProductVariantBase(BaseModel):
    size: str = Field(..., max_length=20)
    color: str = Field(..., max_length=50)
    color_hex: Optional[str] = Field(None, max_length=7)
    stock: int = Field(0, ge=0)
    additional_price: Decimal = Field(default=Decimal("0"))
    is_active: bool = True


class ProductVariantCreate(ProductVariantBase):
    pass


class ProductVariantResponse(ProductVariantBase):
    id: str
    sku_variant: str

    model_config = {"from_attributes": True}


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    original_price: Decimal = Field(..., gt=0)
    sale_price: Optional[Decimal] = Field(None, ge=0)
    discount_percent: int = Field(0, ge=0, le=100)
    category_id: Optional[str] = None
    tags: Optional[str] = None
    is_active: bool = True
    is_featured: bool = False
    is_trending: bool = False
    is_new_arrival: bool = True


class ProductCreate(ProductBase):
    variants: List[ProductVariantCreate] = []


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    short_description: Optional[str] = None
    original_price: Optional[Decimal] = None
    sale_price: Optional[Decimal] = None
    discount_percent: Optional[int] = None
    category_id: Optional[str] = None
    tags: Optional[str] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    is_trending: Optional[bool] = None
    is_new_arrival: Optional[bool] = None


class ProductResponse(ProductBase):
    id: str
    slug: str
    sku: str
    total_stock: int
    avg_rating: Decimal
    review_count: int
    total_sold: int
    images: List[ProductImageResponse] = []
    variants: List[ProductVariantResponse] = []
    created_at: datetime

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    id: str
    name: str
    slug: str
    original_price: Decimal
    sale_price: Optional[Decimal] = None
    discount_percent: int
    avg_rating: Decimal
    review_count: int
    is_featured: bool
    is_trending: bool
    is_new_arrival: bool
    images: List[ProductImageResponse] = []

    model_config = {"from_attributes": True}
