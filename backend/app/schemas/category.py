from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    parent_id: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True
    is_featured: bool = False


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    parent_id: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    image_url: Optional[str] = None


class CategoryResponse(CategoryBase):
    id: str
    slug: str
    image_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class CategoryWithChildren(CategoryResponse):
    subcategories: List["CategoryResponse"] = []
