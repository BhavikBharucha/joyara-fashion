from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.order_repository import OrderRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.user_repository import UserRepository
from app.schemas.common import DashboardStats


class DashboardService:
    def __init__(self, db: AsyncSession):
        self.user_repo = UserRepository(db)
        self.product_repo = ProductRepository(db)
        self.order_repo = OrderRepository(db)

    async def get_stats(self) -> DashboardStats:
        total_users = await self.user_repo.count_customers()
        total_products = await self.product_repo.count()
        total_orders = await self.order_repo.count()
        total_revenue = await self.order_repo.get_total_revenue()

        from app.models.order import Order
        pending_orders = await self.order_repo.count(filters=[Order.status == "pending"])

        recent_orders = await self.order_repo.get_all_with_items(skip=0, limit=5)
        monthly_revenue = await self.order_repo.get_monthly_revenue(months=6)

        return DashboardStats(
            total_users=total_users,
            total_products=total_products,
            total_orders=total_orders,
            total_revenue=total_revenue,
            pending_orders=pending_orders,
            recent_orders=[
                {
                    "order_number": o.order_number,
                    "total_amount": float(o.total_amount),
                    "status": o.status,
                    "created_at": o.created_at.isoformat(),
                }
                for o in recent_orders
            ],
            monthly_revenue=monthly_revenue,
        )
