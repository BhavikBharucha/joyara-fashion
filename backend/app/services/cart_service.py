from typing import List

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cart import CartItem
from app.repositories.cart_repository import CartRepository
from app.repositories.product_repository import ProductRepository
from app.schemas.cart import CartItemCreate, CartItemResponse, CartItemUpdate


class CartService:
    def __init__(self, db: AsyncSession):
        self.repo = CartRepository(db)
        self.product_repo = ProductRepository(db)

    async def get_cart(self, user_id: str) -> List[CartItemResponse]:
        items = await self.repo.get_user_cart(user_id)
        return [CartItemResponse.model_validate(item) for item in items]

    async def add_to_cart(self, user_id: str, data: CartItemCreate) -> CartItemResponse:
        product = await self.product_repo.get_by_id(data.product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        existing = await self.repo.get_cart_item(
            user_id, data.product_id, data.size, data.color
        )
        if existing:
            existing.quantity += data.quantity
            await self.repo.db.flush()
            existing = await self.repo.get_by_id_with_product(existing.id)
            return CartItemResponse.model_validate(existing)

        cart_item = CartItem(
            user_id=user_id,
            product_id=data.product_id,
            variant_id=data.variant_id,
            size=data.size,
            color=data.color,
            quantity=data.quantity,
        )
        cart_item = await self.repo.create(cart_item)
        cart_item = await self.repo.get_by_id_with_product(cart_item.id)
        return CartItemResponse.model_validate(cart_item)

    async def update_cart_item(
        self, user_id: str, item_id: str, data: CartItemUpdate
    ) -> CartItemResponse:
        item = await self.repo.get_by_id(item_id)
        if not item or item.user_id != user_id:
            raise HTTPException(status_code=404, detail="Cart item not found")
        await self.repo.update(item, {"quantity": data.quantity})
        item = await self.repo.get_by_id_with_product(item_id)
        return CartItemResponse.model_validate(item)

    async def remove_from_cart(self, user_id: str, item_id: str) -> None:
        item = await self.repo.get_by_id(item_id)
        if not item or item.user_id != user_id:
            raise HTTPException(status_code=404, detail="Cart item not found")
        await self.repo.delete(item)

    async def clear_cart(self, user_id: str) -> None:
        await self.repo.clear_user_cart(user_id)
