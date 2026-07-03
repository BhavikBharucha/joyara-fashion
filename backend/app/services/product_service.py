import re
import uuid
from typing import List, Optional

from fastapi import HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product, ProductImage, ProductVariant
from app.repositories.product_repository import (
    ProductImageRepository,
    ProductRepository,
    ProductVariantRepository,
)
from app.schemas.product import (
    ProductCreate,
    ProductListResponse,
    ProductResponse,
    ProductUpdate,
)
from app.services.file_service import FileService


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return re.sub(r"-+", "-", text)


def generate_sku() -> str:
    return f"JOY-{uuid.uuid4().hex[:8].upper()}"


class ProductService:
    def __init__(self, db: AsyncSession):
        self.repo = ProductRepository(db)
        self.image_repo = ProductImageRepository(db)
        self.variant_repo = ProductVariantRepository(db)
        self.db = db

    async def create(self, data: ProductCreate) -> ProductResponse:
        slug = slugify(data.name)
        existing = await self.repo.get_by_slug(slug)
        if existing:
            slug = f"{slug}-{uuid.uuid4().hex[:6]}"

        sku = generate_sku()
        while await self.repo.get_by_sku(sku):
            sku = generate_sku()

        product = Product(
            name=data.name,
            slug=slug,
            description=data.description,
            short_description=data.short_description,
            sku=sku,
            original_price=data.original_price,
            sale_price=data.sale_price,
            discount_percent=data.discount_percent,
            category_id=data.category_id,
            tags=data.tags,
            is_active=data.is_active,
            is_featured=data.is_featured,
            is_trending=data.is_trending,
            is_new_arrival=data.is_new_arrival,
        )
        product = await self.repo.create(product)

        total_stock = 0
        for v_data in data.variants:
            sku_variant = f"{sku}-{v_data.size}-{v_data.color}".upper().replace(" ", "-")
            variant = ProductVariant(
                product_id=product.id,
                size=v_data.size,
                color=v_data.color,
                color_hex=v_data.color_hex,
                sku_variant=sku_variant,
                stock=v_data.stock,
                additional_price=v_data.additional_price,
                is_active=v_data.is_active,
            )
            await self.variant_repo.create(variant)
            total_stock += v_data.stock

        product.total_stock = total_stock
        await self.db.flush()

        return await self._get_product_response(product.id)

    async def get_by_id(self, product_id: str) -> ProductResponse:
        return await self._get_product_response(product_id)

    async def get_by_slug(self, slug: str) -> ProductResponse:
        product = await self.repo.get_by_slug(slug)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return ProductResponse.model_validate(product)

    async def update(self, product_id: str, data: ProductUpdate) -> ProductResponse:
        product = await self.repo.get_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        update_data = data.model_dump(exclude_unset=True)
        if "name" in update_data:
            update_data["slug"] = slugify(update_data["name"])

        await self.repo.update(product, update_data)
        return await self._get_product_response(product_id)

    async def delete(self, product_id: str) -> None:
        product = await self.repo.get_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        await self.repo.delete(product)

    async def search(
        self,
        query: Optional[str] = None,
        category_id: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        colors: Optional[List[str]] = None,
        sizes: Optional[List[str]] = None,
        in_stock: Optional[bool] = None,
        sort_by: str = "newest",
        page: int = 1,
        page_size: int = 20,
    ):
        skip = (page - 1) * page_size
        items, total = await self.repo.search(
            query_str=query,
            category_id=category_id,
            min_price=min_price,
            max_price=max_price,
            colors=colors,
            sizes=sizes,
            in_stock=in_stock,
            sort_by=sort_by,
            skip=skip,
            limit=page_size,
        )
        return {
            "items": [ProductListResponse.model_validate(p) for p in items],
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size,
        }

    async def get_all(self, skip: int = 0, limit: int = 20):
        products = await self.repo.get_all(skip=skip, limit=limit)
        total = await self.repo.count()
        return {
            "items": [ProductListResponse.model_validate(p) for p in products],
            "total": total,
            "page": skip // limit + 1,
            "page_size": limit,
            "total_pages": (total + limit - 1) // limit,
        }

    async def upload_image(
        self, product_id: str, file: UploadFile, is_primary: bool = False
    ) -> dict:
        product = await self.repo.get_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        file_service = FileService()
        image_url = await file_service.upload_file(file, folder="products")

        if is_primary:
            existing_images = await self.image_repo.get_by_product(product_id)
            for img in existing_images:
                if img.is_primary:
                    img.is_primary = False
            await self.db.flush()

        sort_order = len(await self.image_repo.get_by_product(product_id))
        image = ProductImage(
            product_id=product_id,
            image_url=image_url,
            is_primary=is_primary,
            sort_order=sort_order,
        )
        image = await self.image_repo.create(image)
        return {"id": image.id, "image_url": image.image_url, "is_primary": image.is_primary}

    async def delete_image(self, image_id: str) -> None:
        image = await self.image_repo.get_by_id(image_id)
        if not image:
            raise HTTPException(status_code=404, detail="Image not found")
        await self.image_repo.delete(image)

    async def get_featured(self) -> List[ProductListResponse]:
        products = await self.repo.get_featured()
        return [ProductListResponse.model_validate(p) for p in products]

    async def get_trending(self) -> List[ProductListResponse]:
        products = await self.repo.get_trending()
        return [ProductListResponse.model_validate(p) for p in products]

    async def get_new_arrivals(self) -> List[ProductListResponse]:
        products = await self.repo.get_new_arrivals()
        return [ProductListResponse.model_validate(p) for p in products]

    async def get_related(self, product_id: str) -> List[ProductListResponse]:
        product = await self.repo.get_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        products = await self.repo.get_related(product)
        return [ProductListResponse.model_validate(p) for p in products]

    async def _get_product_response(self, product_id: str) -> ProductResponse:
        product = await self.repo.get_by_id_with_relations(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return ProductResponse.model_validate(product)
