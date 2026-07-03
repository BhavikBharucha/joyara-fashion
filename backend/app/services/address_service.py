from typing import List

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.address import Address
from app.repositories.address_repository import AddressRepository
from app.schemas.address import AddressCreate, AddressResponse, AddressUpdate


class AddressService:
    def __init__(self, db: AsyncSession):
        self.repo = AddressRepository(db)

    async def get_user_addresses(self, user_id: str) -> List[AddressResponse]:
        addresses = await self.repo.get_user_addresses(user_id)
        return [AddressResponse.model_validate(a) for a in addresses]

    async def create(self, user_id: str, data: AddressCreate) -> AddressResponse:
        if data.is_default:
            await self.repo.clear_default(user_id)

        address = Address(user_id=user_id, **data.model_dump())
        address = await self.repo.create(address)
        return AddressResponse.model_validate(address)

    async def update(self, user_id: str, address_id: str, data: AddressUpdate) -> AddressResponse:
        address = await self.repo.get_by_id(address_id)
        if not address or address.user_id != user_id:
            raise HTTPException(status_code=404, detail="Address not found")

        update_data = data.model_dump(exclude_unset=True)
        if update_data.get("is_default"):
            await self.repo.clear_default(user_id)

        address = await self.repo.update(address, update_data)
        return AddressResponse.model_validate(address)

    async def delete(self, user_id: str, address_id: str) -> None:
        address = await self.repo.get_by_id(address_id)
        if not address or address.user_id != user_id:
            raise HTTPException(status_code=404, detail="Address not found")
        await self.repo.delete(address)
