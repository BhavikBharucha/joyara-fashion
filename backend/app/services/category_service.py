import re
from typing import List

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.repositories.category_repository import CategoryRepository
from app.schemas.category import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
    CategoryWithChildren,
)


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return re.sub(r"-+", "-", text)


class CategoryService:
    def __init__(self, db: AsyncSession):
        self.repo = CategoryRepository(db)

    async def create(self, data: CategoryCreate) -> CategoryResponse:
        slug = slugify(data.name)
        existing = await self.repo.get_by_slug(slug)
        if existing:
            slug = f"{slug}-{existing.id[:6]}"

        category = Category(
            name=data.name,
            slug=slug,
            description=data.description,
            parent_id=data.parent_id,
            sort_order=data.sort_order,
            is_active=data.is_active,
            is_featured=data.is_featured,
        )
        category = await self.repo.create(category)
        return CategoryResponse.model_validate(category)

    async def get_all(self, skip: int = 0, limit: int = 50) -> dict:
        categories = await self.repo.get_all(skip=skip, limit=limit)
        total = await self.repo.count()
        return {
            "items": [CategoryResponse.model_validate(c) for c in categories],
            "total": total,
            "page": skip // limit + 1,
            "page_size": limit,
            "total_pages": (total + limit - 1) // limit,
        }

    async def get_active(self) -> List[CategoryResponse]:
        categories = await self.repo.get_active_categories()
        return [CategoryResponse.model_validate(c) for c in categories]

    async def get_by_id(self, category_id: str) -> CategoryWithChildren:
        category = await self.repo.get_with_subcategories(category_id)
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        return CategoryWithChildren.model_validate(category)

    async def get_by_slug(self, slug: str) -> CategoryResponse:
        category = await self.repo.get_by_slug(slug)
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        return CategoryResponse.model_validate(category)

    async def update(self, category_id: str, data: CategoryUpdate) -> CategoryResponse:
        category = await self.repo.get_by_id(category_id)
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

        update_data = data.model_dump(exclude_unset=True)
        if "name" in update_data:
            update_data["slug"] = slugify(update_data["name"])

        category = await self.repo.update(category, update_data)
        return CategoryResponse.model_validate(category)

    async def delete(self, category_id: str) -> None:
        category = await self.repo.get_by_id(category_id)
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        await self.repo.delete(category)

    async def get_featured(self) -> List[CategoryResponse]:
        categories = await self.repo.get_featured()
        return [CategoryResponse.model_validate(c) for c in categories]
