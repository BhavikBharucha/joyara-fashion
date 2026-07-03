from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.address import AddressCreate, AddressResponse, AddressUpdate
from app.schemas.common import MessageResponse
from app.services.address_service import AddressService

router = APIRouter()


@router.get("/")
async def get_addresses(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AddressService(db)
    return await service.get_user_addresses(user.id)


@router.post("/", response_model=AddressResponse)
async def create_address(
    data: AddressCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AddressService(db)
    return await service.create(user.id, data)


@router.put("/{address_id}", response_model=AddressResponse)
async def update_address(
    address_id: str,
    data: AddressUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AddressService(db)
    return await service.update(user.id, address_id, data)


@router.delete("/{address_id}", response_model=MessageResponse)
async def delete_address(
    address_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AddressService(db)
    await service.delete(user.id, address_id)
    return MessageResponse(message="Address deleted")
