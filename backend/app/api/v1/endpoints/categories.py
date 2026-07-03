from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.dependencies.auth import get_admin_user
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate, CategoryWithChildren
from app.schemas.common import MessageResponse
from app.services.category_service import CategoryService

router = APIRouter()


@router.get("/")
async def get_categories(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    service = CategoryService(db)
    skip = (page - 1) * page_size
    return await service.get_all(skip=skip, limit=page_size)


@router.get("/active")
async def get_active_categories(db: AsyncSession = Depends(get_db)):
    service = CategoryService(db)
    return await service.get_active()


@router.get("/featured")
async def get_featured_categories(db: AsyncSession = Depends(get_db)):
    service = CategoryService(db)
    return await service.get_featured()


@router.get("/slug/{slug}", response_model=CategoryResponse)
async def get_category_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    service = CategoryService(db)
    return await service.get_by_slug(slug)


@router.get("/{category_id}", response_model=CategoryWithChildren)
async def get_category(category_id: str, db: AsyncSession = Depends(get_db)):
    service = CategoryService(db)
    return await service.get_by_id(category_id)


@router.post("/", response_model=CategoryResponse)
async def create_category(
    data: CategoryCreate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    service = CategoryService(db)
    return await service.create(data)


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: str,
    data: CategoryUpdate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    service = CategoryService(db)
    return await service.update(category_id, data)


@router.delete("/{category_id}", response_model=MessageResponse)
async def delete_category(
    category_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    service = CategoryService(db)
    await service.delete(category_id)
    return MessageResponse(message="Category deleted successfully")
