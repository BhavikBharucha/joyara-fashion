from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user_repository import UserRepository
from app.schemas.user import UserResponse, UserUpdate


class UserService:
    def __init__(self, db: AsyncSession):
        self.repo = UserRepository(db)

    async def get_profile(self, user_id: str) -> UserResponse:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return UserResponse.model_validate(user)

    async def update_profile(self, user_id: str, data: UserUpdate) -> UserResponse:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user = await self.repo.update(user, data.model_dump(exclude_unset=True))
        return UserResponse.model_validate(user)

    async def get_all_customers(self, skip: int = 0, limit: int = 20):
        users = await self.repo.get_customers(skip=skip, limit=limit)
        total = await self.repo.count_customers()
        return {
            "items": [UserResponse.model_validate(u) for u in users],
            "total": total,
            "page": skip // limit + 1,
            "page_size": limit,
            "total_pages": (total + limit - 1) // limit,
        }

    async def toggle_user_status(self, user_id: str) -> UserResponse:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user = await self.repo.update(user, {"is_active": not user.is_active})
        return UserResponse.model_validate(user)
