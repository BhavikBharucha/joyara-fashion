import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ProductCard from '../../components/common/ProductCard';
import { ProductGridSkeleton } from '../../components/common/Skeleton';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { SORT_OPTIONS } from '../../constants';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const q = searchParams.get('q') || '';
  const categoryId = searchParams.get('category_id') || '';
  const sortBy = searchParams.get('sort_by') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');
  const minPrice = searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined;
  const maxPrice = searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined;
  const isTrending = searchParams.get('is_trending') === 'true' ? true : undefined;
  const isFeatured = searchParams.get('is_featured') === 'true' ? true : undefined;
  const isNewArrival = searchParams.get('is_new_arrival') === 'true' ? true : undefined;

  const { data: categories } = useQuery({
    queryKey: ['categories-active'],
    queryFn: () => categoryService.getActive().then((r) => r.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['search', q, categoryId, sortBy, page, minPrice, maxPrice, isTrending, isFeatured, isNewArrival],
    queryFn: () =>
      productService.search({
        q: q || undefined,
        category_id: categoryId || undefined,
        sort_by: sortBy,
        page,
        page_size: 20,
        min_price: minPrice,
        max_price: maxPrice,
        is_trending: isTrending,
        is_featured: isFeatured,
        is_new_arrival: isNewArrival,
      }).then((r) => r.data),
    staleTime: 0,
  });

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.set('page', '1');
    setSearchParams(params);
  };

  return (
    <div className="container-custom py-8 md:py-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">
            {q ? `Results for "${q}"` : isTrending ? 'Trending' : isFeatured ? 'Featured' : isNewArrival ? 'New Arrivals' : categoryId ? 'Category' : 'All Products'}
          </h1>
          {data && <p className="text-sm text-secondary-500 mt-1">{data.total} products found</p>}
        </div>
        <div className="flex items-center gap-4">
          <select
            value={sortBy}
            onChange={(e) => updateParam('sort_by', e.target.value)}
            className="input-field w-auto text-sm"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button onClick={() => setFiltersOpen(!filtersOpen)} className="md:hidden p-2 border border-secondary-200">
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filters */}
        <aside className={`${filtersOpen ? 'fixed inset-0 z-50 bg-white p-6 overflow-auto' : 'hidden'} md:block md:static md:w-56 flex-shrink-0`}>
          <div className="flex items-center justify-between mb-6 md:hidden">
            <h3 className="text-lg font-medium">Filters</h3>
            <button onClick={() => setFiltersOpen(false)}><XMarkIcon className="w-6 h-6" /></button>
          </div>

          {/* Category filter */}
          {categories && categories.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm tracking-widest uppercase mb-3">Category</h4>
              <div className="space-y-2">
                <button
                  onClick={() => updateParam('category_id', '')}
                  className={`block text-sm ${!categoryId ? 'text-secondary-900 font-medium' : 'text-secondary-500 hover:text-secondary-900'}`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateParam('category_id', cat.id)}
                    className={`block text-sm ${categoryId === cat.id ? 'text-secondary-900 font-medium' : 'text-secondary-500 hover:text-secondary-900'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price Range */}
          <div className="mb-6">
            <h4 className="text-sm tracking-widest uppercase mb-3">Price Range</h4>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice || ''}
                onChange={(e) => updateParam('min_price', e.target.value)}
                className="input-field w-full text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice || ''}
                onChange={(e) => updateParam('max_price', e.target.value)}
                className="input-field w-full text-sm"
              />
            </div>
          </div>

          <button
            onClick={() => { setSearchParams({}); setFiltersOpen(false); }}
            className="text-sm text-secondary-500 underline"
          >
            Clear All Filters
          </button>
        </aside>

        {/* Products */}
        <div className="flex-1">
          {isLoading ? (
            <ProductGridSkeleton />
          ) : data?.items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-secondary-500">No products found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {data?.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {data && data.total_pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  {Array.from({ length: data.total_pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => updateParam('page', p.toString())}
                      className={`w-10 h-10 text-sm ${p === page ? 'bg-secondary-900 text-white' : 'border border-secondary-200 hover:border-secondary-900'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
