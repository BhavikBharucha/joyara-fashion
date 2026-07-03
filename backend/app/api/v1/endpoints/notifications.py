from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.common import MessageResponse
from app.services.notification_service import NotificationService

router = APIRouter()


@router.get("/")
async def get_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = NotificationService(db)
    return await service.get_user_notifications(user.id, page=page, page_size=page_size)


@router.patch("/{notification_id}/read", response_model=MessageResponse)
async def mark_as_read(
    notification_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = NotificationService(db)
    await service.mark_as_read(notification_id, user.id)
    return MessageResponse(message="Marked as read")


@router.patch("/read-all", response_model=MessageResponse)
async def mark_all_read(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = NotificationService(db)
    await service.mark_all_read(user.id)
    return MessageResponse(message="All notifications marked as read")
