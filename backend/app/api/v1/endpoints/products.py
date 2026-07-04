from typing import List, Optional

from fastapi import APIRouter, Depends, File, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.dependencies.auth import get_admin_user
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from app.services.product_service import ProductService

router = APIRouter()


@router.get("/search")
async def search_products(
    q: Optional[str] = None,
    category_id: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    in_stock: Optional[bool] = None,
    sort_by: str = Query("newest", regex="^(newest|price_low|price_high|rating|bestselling)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(db)
    return await service.search(
        query=q,
        category_id=category_id,
        min_price=min_price,
        max_price=max_price,
        in_stock=in_stock,
        sort_by=sort_by,
        page=page,
        page_size=page_size,
    )


@router.get("/featured")
async def get_featured_products(db: AsyncSession = Depends(get_db)):
    service = ProductService(db)
    return await service.get_featured()


@router.get("/trending")
async def get_trending_products(db: AsyncSession = Depends(get_db)):
    service = ProductService(db)
    return await service.get_trending()


@router.get("/new-arrivals")
async def get_new_arrivals(db: AsyncSession = Depends(get_db)):
    service = ProductService(db)
    return await service.get_new_arrivals()


@router.get("/slug/{slug}", response_model=ProductResponse)
async def get_product_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    service = ProductService(db)
    return await service.get_by_slug(slug)


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str, db: AsyncSession = Depends(get_db)):
    service = ProductService(db)
    return await service.get_by_id(product_id)


@router.get("/{product_id}/related")
async def get_related_products(product_id: str, db: AsyncSession = Depends(get_db)):
    service = ProductService(db)
    return await service.get_related(product_id)


@router.get("/")
async def get_all_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(db)
    skip = (page - 1) * page_size
    return await service.get_all(skip=skip, limit=page_size)


@router.post("/", response_model=ProductResponse)
async def create_product(
    data: ProductCreate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(db)
    return await service.create(data)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    data: ProductUpdate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(db)
    return await service.update(product_id, data)


@router.delete("/{product_id}", response_model=MessageResponse)
async def delete_product(
    product_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(db)
    await service.delete(product_id)
    return MessageResponse(message="Product deleted successfully")


@router.post("/{product_id}/images")
async def upload_product_image(
    product_id: str,
    file: UploadFile = File(...),
    is_primary: bool = Query(False),
    color: Optional[str] = Query(None),
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(db)
    return await service.upload_image(product_id, file, is_primary, color)


@router.delete("/images/{image_id}", response_model=MessageResponse)
async def delete_product_image(
    image_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(db)
    await service.delete_image(image_id)
    return MessageResponse(message="Image deleted successfully")
