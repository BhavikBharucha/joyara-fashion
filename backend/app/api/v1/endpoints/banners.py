from fastapi import APIRouter, Depends, File, Form, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.dependencies.auth import get_admin_user
from app.models.user import User
from app.schemas.banner import BannerCreate, BannerResponse, BannerUpdate
from app.schemas.common import MessageResponse
from app.services.banner_service import BannerService

router = APIRouter()


@router.get("/active")
async def get_active_banners(
    position: str = Query("hero"),
    db: AsyncSession = Depends(get_db),
):
    service = BannerService(db)
    return await service.get_active(position)


@router.get("/")
async def get_all_banners(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    service = BannerService(db)
    return await service.get_all()


@router.post("/", response_model=BannerResponse)
async def create_banner(
    title: str = Form(...),
    subtitle: str = Form(None),
    link_url: str = Form(None),
    position: str = Form("hero"),
    sort_order: int = Form(0),
    is_active: bool = Form(True),
    image: UploadFile = File(...),
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    data = BannerCreate(
        title=title,
        subtitle=subtitle,
        link_url=link_url,
        position=position,
        sort_order=sort_order,
        is_active=is_active,
    )
    service = BannerService(db)
    return await service.create(data, image)


@router.put("/{banner_id}", response_model=BannerResponse)
async def update_banner(
    banner_id: str,
    data: BannerUpdate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    service = BannerService(db)
    return await service.update(banner_id, data)


@router.delete("/{banner_id}", response_model=MessageResponse)
async def delete_banner(
    banner_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    service = BannerService(db)
    await service.delete(banner_id)
    return MessageResponse(message="Banner deleted")
