from typing import List

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification
from app.repositories.notification_repository import NotificationRepository


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.repo = NotificationRepository(db)

    async def get_user_notifications(self, user_id: str, page: int = 1, page_size: int = 20):
        skip = (page - 1) * page_size
        notifications = await self.repo.get_user_notifications(user_id, skip=skip, limit=page_size)
        unread = await self.repo.count_unread(user_id)
        return {
            "items": [
                {
                    "id": n.id,
                    "title": n.title,
                    "message": n.message,
                    "type": n.type,
                    "is_read": n.is_read,
                    "link": n.link,
                    "created_at": n.created_at.isoformat(),
                }
                for n in notifications
            ],
            "unread_count": unread,
        }

    async def mark_as_read(self, notification_id: str, user_id: str) -> None:
        notification = await self.repo.get_by_id(notification_id)
        if not notification or notification.user_id != user_id:
            raise HTTPException(status_code=404, detail="Notification not found")
        await self.repo.update(notification, {"is_read": True})

    async def mark_all_read(self, user_id: str) -> None:
        await self.repo.mark_all_read(user_id)

    async def create_notification(
        self,
        user_id: str,
        title: str,
        message: str,
        type: str = "system",
        link: str = None,
    ) -> None:
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=type,
            link=link,
        )
        await self.repo.create(notification)
