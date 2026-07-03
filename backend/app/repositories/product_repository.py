from typing import List, Optional

from sqlalchemy import or_, select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.product import Product, ProductImage, ProductVariant
from app.repositories.base import BaseRepository


class ProductRepository(BaseRepository[Product]):
    def __init__(self, db: AsyncSession):
        super().__init__(Product, db)

    def _with_relations(self, query):
        return query.options(
            selectinload(Product.images),
            selectinload(Product.variants),
        )

    async def get_by_id_with_relations(self, product_id: str) -> Optional[Product]:
        result = await self.db.execute(
            self._with_relations(select(Product).where(Product.id == product_id))
        )
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str) -> Optional[Product]:
        result = await self.db.execute(
            self._with_relations(select(Product).where(Product.slug == slug))
        )
        return result.scalar_one_or_none()

    async def get_by_sku(self, sku: str) -> Optional[Product]:
        result = await self.db.execute(select(Product).where(Product.sku == sku))
        return result.scalar_one_or_none()

    async def search(
        self,
        query_str: Optional[str] = None,
        category_id: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        colors: Optional[List[str]] = None,
        sizes: Optional[List[str]] = None,
        in_stock: Optional[bool] = None,
        sort_by: str = "newest",
        skip: int = 0,
        limit: int = 20,
    ):
        query = self._with_relations(select(Product).where(Product.is_active == True))

        if query_str:
            search = f"%{query_str}%"
            query = query.where(
                or_(
                    Product.name.ilike(search),
                    Product.description.ilike(search),
                    Product.tags.ilike(search),
                )
            )

        if category_id:
            query = query.where(Product.category_id == category_id)

        if min_price is not None:
            effective_price = func.coalesce(Product.sale_price, Product.original_price)
            query = query.where(effective_price >= min_price)

        if max_price is not None:
            effective_price = func.coalesce(Product.sale_price, Product.original_price)
            query = query.where(effective_price <= max_price)

        if in_stock:
            query = query.where(Product.total_stock > 0)

        sort_map = {
            "newest": Product.created_at.desc(),
            "price_low": func.coalesce(Product.sale_price, Product.original_price).asc(),
            "price_high": func.coalesce(Product.sale_price, Product.original_price).desc(),
            "rating": Product.avg_rating.desc(),
            "bestselling": Product.total_sold.desc(),
        }
        query = query.order_by(sort_map.get(sort_by, Product.created_at.desc()))

        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_query)).scalar() or 0

        result = await self.db.execute(query.offset(skip).limit(limit))
        items = list(result.scalars().unique().all())

        return items, total

    async def get_featured(self, limit: int = 8) -> List[Product]:
        result = await self.db.execute(
            self._with_relations(
                select(Product)
                .where(Product.is_active == True, Product.is_featured == True)
                .order_by(Product.created_at.desc())
                .limit(limit)
            )
        )
        return list(result.scalars().unique().all())

    async def get_trending(self, limit: int = 8) -> List[Product]:
        result = await self.db.execute(
            self._with_relations(
                select(Product)
                .where(Product.is_active == True, Product.is_trending == True)
                .order_by(Product.total_sold.desc())
                .limit(limit)
            )
        )
        return list(result.scalars().unique().all())

    async def get_new_arrivals(self, limit: int = 8) -> List[Product]:
        result = await self.db.execute(
            self._with_relations(
                select(Product)
                .where(Product.is_active == True, Product.is_new_arrival == True)
                .order_by(Product.created_at.desc())
                .limit(limit)
            )
        )
        return list(result.scalars().unique().all())

    async def get_related(self, product: Product, limit: int = 4) -> List[Product]:
        result = await self.db.execute(
            self._with_relations(
                select(Product)
                .where(
                    Product.is_active == True,
                    Product.category_id == product.category_id,
                    Product.id != product.id,
                )
                .order_by(func.random())
                .limit(limit)
            )
        )
        return list(result.scalars().unique().all())


class ProductImageRepository(BaseRepository[ProductImage]):
    def __init__(self, db: AsyncSession):
        super().__init__(ProductImage, db)

    async def get_by_product(self, product_id: str) -> List[ProductImage]:
        result = await self.db.execute(
            select(ProductImage)
            .where(ProductImage.product_id == product_id)
            .order_by(ProductImage.sort_order)
        )
        return list(result.scalars().all())


class ProductVariantRepository(BaseRepository[ProductVariant]):
    def __init__(self, db: AsyncSession):
        super().__init__(ProductVariant, db)

    async def get_by_product(self, product_id: str) -> List[ProductVariant]:
        result = await self.db.execute(
            select(ProductVariant).where(ProductVariant.product_id == product_id)
        )
        return list(result.scalars().all())

    async def get_by_sku_variant(self, sku_variant: str) -> Optional[ProductVariant]:
        result = await self.db.execute(
            select(ProductVariant).where(ProductVariant.sku_variant == sku_variant)
        )
        return result.scalar_one_or_none()
