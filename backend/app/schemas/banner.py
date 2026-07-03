from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class BannerCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    subtitle: Optional[str] = Field(None, max_length=500)
    link_url: Optional[str] = None
    position: str = Field("hero", max_length=50)
    sort_order: int = 0
    is_active: bool = True


class BannerUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    link_url: Optional[str] = None
    position: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class BannerResponse(BaseModel):
    id: str
    title: str
    subtitle: Optional[str]
    image_url: str
    link_url: Optional[str]
    position: str
    sort_order: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
