from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, db: AsyncSession):
        super().__init__(User, db)

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_customers(self, skip: int = 0, limit: int = 20):
        return await self.get_all(skip=skip, limit=limit, filters=[User.role == "customer"])

    async def count_customers(self) -> int:
        return await self.count(filters=[User.role == "customer"])
