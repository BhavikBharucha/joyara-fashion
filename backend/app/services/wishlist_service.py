from typing import List

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.wishlist import WishlistItem
from app.repositories.product_repository import ProductRepository
from app.repositories.wishlist_repository import WishlistRepository
from app.schemas.wishlist import WishlistItemResponse


class WishlistService:
    def __init__(self, db: AsyncSession):
        self.repo = WishlistRepository(db)
        self.product_repo = ProductRepository(db)

    async def get_wishlist(self, user_id: str) -> List[WishlistItemResponse]:
        items = await self.repo.get_user_wishlist(user_id)
        return [WishlistItemResponse.model_validate(item) for item in items]

    async def add_to_wishlist(self, user_id: str, product_id: str) -> WishlistItemResponse:
        product = await self.product_repo.get_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        existing = await self.repo.get_item(user_id, product_id)
        if existing:
            raise HTTPException(status_code=400, detail="Already in wishlist")

        item = WishlistItem(user_id=user_id, product_id=product_id)
        item = await self.repo.create(item)

        items = await self.repo.get_user_wishlist(user_id)
        for wi in items:
            if wi.id == item.id:
                return WishlistItemResponse.model_validate(wi)

        return WishlistItemResponse(
            id=item.id,
            product_id=item.product_id,
            product=None,
            created_at=item.created_at,
        )

    async def remove_from_wishlist(self, user_id: str, product_id: str) -> None:
        item = await self.repo.get_item(user_id, product_id)
        if not item:
            raise HTTPException(status_code=404, detail="Item not in wishlist")
        await self.repo.delete(item)
