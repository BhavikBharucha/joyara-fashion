from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.dependencies.auth import get_admin_user
from app.models.user import User
from app.schemas.common import DashboardStats
from app.services.dashboard_service import DashboardService

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    service = DashboardService(db)
    return await service.get_stats()
