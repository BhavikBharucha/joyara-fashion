import json
from decimal import Decimal
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order, OrderItem
from app.repositories.address_repository import AddressRepository
from app.repositories.cart_repository import CartRepository
from app.repositories.coupon_repository import CouponRepository
from app.repositories.order_repository import OrderRepository
from app.repositories.product_repository import ProductRepository
from app.schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate


class OrderService:
    def __init__(self, db: AsyncSession):
        self.repo = OrderRepository(db)
        self.product_repo = ProductRepository(db)
        self.address_repo = AddressRepository(db)
        self.cart_repo = CartRepository(db)
        self.coupon_repo = CouponRepository(db)
        self.db = db

    async def create_order(self, user_id: str, data: OrderCreate) -> OrderResponse:
        address = await self.address_repo.get_by_id(data.shipping_address_id)
        if not address or address.user_id != user_id:
            raise HTTPException(status_code=400, detail="Invalid shipping address")

        shipping_addr = json.dumps({
            "full_name": address.full_name,
            "phone": address.phone,
            "address_line1": address.address_line1,
            "address_line2": address.address_line2,
            "city": address.city,
            "state": address.state,
            "postal_code": address.postal_code,
            "country": address.country,
        })

        order_number = await self.repo.generate_order_number()
        subtotal = Decimal("0")
        order_items = []

        for item_data in data.items:
            product = await self.product_repo.get_by_id_with_relations(item_data.product_id)
            if not product:
                raise HTTPException(status_code=400, detail=f"Product not found")
            if not product.is_active:
                raise HTTPException(status_code=400, detail=f"Product {product.name} is not available")

            unit_price = product.sale_price or product.original_price
            total_price = unit_price * item_data.quantity
            subtotal += total_price

            primary_image = None
            for img in product.images:
                if img.is_primary:
                    primary_image = img.image_url
                    break

            order_items.append(OrderItem(
                product_id=product.id,
                product_name=product.name,
                product_image=primary_image,
                size=item_data.size,
                color=item_data.color,
                quantity=item_data.quantity,
                unit_price=unit_price,
                total_price=total_price,
            ))

        discount_amount = Decimal("0")
        if data.coupon_code:
            coupon = await self.coupon_repo.get_by_code(data.coupon_code)
            if coupon and coupon.is_active:
                if coupon.discount_type == "percentage":
                    discount_amount = subtotal * coupon.discount_value / 100
                    if coupon.max_discount_amount:
                        discount_amount = min(discount_amount, coupon.max_discount_amount)
                else:
                    discount_amount = coupon.discount_value
                coupon.used_count += 1

        shipping_amount = Decimal("0") if subtotal >= 999 else Decimal("99")
        tax_amount = (subtotal - discount_amount) * Decimal("0.18")
        total_amount = subtotal - discount_amount + shipping_amount + tax_amount

        order = Order(
            order_number=order_number,
            user_id=user_id,
            status="pending",
            payment_status="pending",
            payment_method=data.payment_method,
            subtotal=subtotal,
            discount_amount=discount_amount,
            shipping_amount=shipping_amount,
            tax_amount=tax_amount,
            total_amount=total_amount,
            coupon_code=data.coupon_code,
            shipping_address=shipping_addr,
            notes=data.notes,
        )
        order = await self.repo.create(order)

        for item in order_items:
            item.order_id = order.id
            self.db.add(item)
        await self.db.flush()

        await self.cart_repo.clear_user_cart(user_id)

        return await self._get_order_response(order.order_number)

    async def get_user_orders(self, user_id: str, page: int = 1, page_size: int = 20):
        skip = (page - 1) * page_size
        orders = await self.repo.get_user_orders(user_id, skip=skip, limit=page_size)
        total = await self.repo.count_user_orders(user_id)
        return {
            "items": [OrderResponse.model_validate(o) for o in orders],
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size,
        }

    async def get_order(self, order_number: str, user_id: Optional[str] = None) -> OrderResponse:
        order = await self.repo.get_by_order_number(order_number)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        if user_id and order.user_id != user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        return OrderResponse.model_validate(order)

    async def update_status(self, order_number: str, data: OrderStatusUpdate) -> OrderResponse:
        order = await self.repo.get_by_order_number(order_number)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        update_data = {"status": data.status}
        if data.tracking_number:
            update_data["tracking_number"] = data.tracking_number
        if data.status == "delivered":
            from datetime import datetime, timezone
            update_data["delivered_at"] = datetime.now(timezone.utc)
            update_data["payment_status"] = "paid"
        if data.status == "cancelled":
            from datetime import datetime, timezone
            update_data["cancelled_at"] = datetime.now(timezone.utc)

        await self.repo.update(order, update_data)
        return OrderResponse.model_validate(order)

    async def cancel_order(self, order_number: str, user_id: str) -> OrderResponse:
        order = await self.repo.get_by_order_number(order_number)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        if order.user_id != user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        if order.status not in ("pending", "confirmed"):
            raise HTTPException(status_code=400, detail="Order cannot be cancelled")

        return await self.update_status(order_number, OrderStatusUpdate(status="cancelled"))

    async def get_all_orders(self, page: int = 1, page_size: int = 20, status: Optional[str] = None):
        skip = (page - 1) * page_size
        orders = await self.repo.get_all_with_items(skip=skip, limit=page_size, status=status)
        filters = []
        if status:
            from app.models.order import Order as OrderModel
            filters.append(OrderModel.status == status)
        total = await self.repo.count(filters=filters if filters else None)
        return {
            "items": [OrderResponse.model_validate(o) for o in orders],
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size,
        }

    async def _get_order_response(self, order_number: str) -> OrderResponse:
        order = await self.repo.get_by_order_number(order_number)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return OrderResponse.model_validate(order)
