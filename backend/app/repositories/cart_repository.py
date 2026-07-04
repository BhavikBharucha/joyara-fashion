from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.cart import CartItem
from app.models.product import Product
from app.repositories.base import BaseRepository


class CartRepository(BaseRepository[CartItem]):
    def __init__(self, db: AsyncSession):
        super().__init__(CartItem, db)

    async def get_user_cart(self, user_id: str) -> List[CartItem]:
        result = await self.db.execute(
            select(CartItem)
            .options(
                selectinload(CartItem.product).selectinload(Product.images)
            )
            .where(CartItem.user_id == user_id)
            .order_by(CartItem.created_at.desc())
        )
        return list(result.scalars().unique().all())

    async def get_cart_item(
        self, user_id: str, product_id: str, size: Optional[str] = None, color: Optional[str] = None
    ) -> Optional[CartItem]:
        query = select(CartItem).options(
            selectinload(CartItem.product).selectinload(Product.images)
        ).where(
            CartItem.user_id == user_id,
            CartItem.product_id == product_id,
        )
        if size:
            query = query.where(CartItem.size == size)
        if color:
            query = query.where(CartItem.color == color)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_id_with_product(self, item_id: str) -> Optional[CartItem]:
        result = await self.db.execute(
            select(CartItem)
            .options(selectinload(CartItem.product).selectinload(Product.images))
            .where(CartItem.id == item_id)
        )
        return result.scalar_one_or_none()

    async def clear_user_cart(self, user_id: str) -> None:
        cart_items = await self.get_user_cart(user_id)
        for item in cart_items:
            await self.db.delete(item)
        await self.db.flush()
