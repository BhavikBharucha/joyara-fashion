from typing import List

from fastapi import HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.banner import Banner
from app.repositories.banner_repository import BannerRepository
from app.schemas.banner import BannerCreate, BannerResponse, BannerUpdate
from app.services.file_service import FileService


class BannerService:
    def __init__(self, db: AsyncSession):
        self.repo = BannerRepository(db)

    async def create(self, data: BannerCreate, image: UploadFile) -> BannerResponse:
        file_service = FileService()
        image_url = await file_service.upload_file(image, folder="banners")

        banner = Banner(
            title=data.title,
            subtitle=data.subtitle,
            image_url=image_url,
            link_url=data.link_url,
            position=data.position,
            sort_order=data.sort_order,
            is_active=data.is_active,
        )
        banner = await self.repo.create(banner)
        return BannerResponse.model_validate(banner)

    async def get_all(self, skip: int = 0, limit: int = 20):
        banners = await self.repo.get_all(skip=skip, limit=limit)
        total = await self.repo.count()
        return {
            "items": [BannerResponse.model_validate(b) for b in banners],
            "total": total,
            "page": skip // limit + 1,
            "page_size": limit,
            "total_pages": (total + limit - 1) // limit,
        }

    async def get_active(self, position: str = "hero") -> List[BannerResponse]:
        banners = await self.repo.get_active_banners(position)
        return [BannerResponse.model_validate(b) for b in banners]

    async def update(self, banner_id: str, data: BannerUpdate) -> BannerResponse:
        banner = await self.repo.get_by_id(banner_id)
        if not banner:
            raise HTTPException(status_code=404, detail="Banner not found")
        banner = await self.repo.update(banner, data.model_dump(exclude_unset=True))
        return BannerResponse.model_validate(banner)

    async def delete(self, banner_id: str) -> None:
        banner = await self.repo.get_by_id(banner_id)
        if not banner:
            raise HTTPException(status_code=404, detail="Banner not found")
        await self.repo.delete(banner)
