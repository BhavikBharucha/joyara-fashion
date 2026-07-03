from typing import List, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.order import Order, OrderItem
from app.repositories.base import BaseRepository


class OrderRepository(BaseRepository[Order]):
    def __init__(self, db: AsyncSession):
        super().__init__(Order, db)

    async def get_by_order_number(self, order_number: str) -> Optional[Order]:
        result = await self.db.execute(
            select(Order)
            .options(selectinload(Order.items))
            .where(Order.order_number == order_number)
        )
        return result.scalar_one_or_none()

    async def get_user_orders(self, user_id: str, skip: int = 0, limit: int = 20) -> List[Order]:
        result = await self.db.execute(
            select(Order)
            .options(selectinload(Order.items))
            .where(Order.user_id == user_id)
            .order_by(Order.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().unique().all())

    async def count_user_orders(self, user_id: str) -> int:
        return await self.count(filters=[Order.user_id == user_id])

    async def get_all_with_items(self, skip: int = 0, limit: int = 20, status: Optional[str] = None):
        query = select(Order).options(selectinload(Order.items))
        if status:
            query = query.where(Order.status == status)
        query = query.order_by(Order.created_at.desc()).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().unique().all())

    async def get_total_revenue(self) -> float:
        result = await self.db.execute(
            select(func.sum(Order.total_amount)).where(Order.payment_status == "paid")
        )
        return float(result.scalar() or 0)

    async def get_monthly_revenue(self, months: int = 12):
        result = await self.db.execute(
            select(
                func.date_format(Order.created_at, "%Y-%m").label("month"),
                func.sum(Order.total_amount).label("revenue"),
                func.count(Order.id).label("orders"),
            )
            .where(Order.payment_status == "paid")
            .group_by("month")
            .order_by(func.date_format(Order.created_at, "%Y-%m").desc())
            .limit(months)
        )
        return [{"month": r.month, "revenue": float(r.revenue), "orders": r.orders} for r in result]

    async def generate_order_number(self) -> str:
        result = await self.db.execute(select(func.count(Order.id)))
        count = (result.scalar() or 0) + 1
        return f"JOY-{count:06d}"
