import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { HeartIcon, MinusIcon, PlusIcon, StarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { productService } from '../../services/productService';
import { cartService } from '../../services/cartService';
import { wishlistService } from '../../services/wishlistService';
import { reviewService } from '../../services/reviewService';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { addCartItem } from '../../store/slices/cartSlice';
import { addWishlistItem, removeWishlistItem } from '../../store/slices/wishlistSlice';
import ProductCard from '../../components/common/ProductCard';
import { ProductGridSkeleton } from '../../components/common/Skeleton';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const wishlistItems = useAppSelector((s) => s.wishlist.items);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productService.getBySlug(slug!).then((r) => r.data),
    enabled: !!slug,
    staleTime: 0,
  });

  const { data: related } = useQuery({
    queryKey: ['related', product?.id],
    queryFn: () => productService.getRelated(product!.id).then((r) => r.data),
    enabled: !!product?.id,
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', product?.id],
    queryFn: () => reviewService.getProductReviews(product!.id).then((r) => r.data),
    enabled: !!product?.id,
  });

  const inStockColors = useMemo(() => {
    if (!product) return [];
    const colorStockMap = new Map<string, { color: string; hex: string | null; totalStock: number }>();
    for (const v of product.variants) {
      const existing = colorStockMap.get(v.color);
      if (existing) {
        existing.totalStock += v.stock;
      } else {
        colorStockMap.set(v.color, { color: v.color, hex: v.color_hex, totalStock: v.stock });
      }
    }
    return Array.from(colorStockMap.values()).filter((c) => c.totalStock > 0);
  }, [product]);

  const inStockSizes = useMemo(() => {
    if (!product) return [];
    const sizeStockMap = new Map<string, number>();
    for (const v of product.variants) {
      if (selectedColor && v.color !== selectedColor) continue;
      sizeStockMap.set(v.size, (sizeStockMap.get(v.size) || 0) + v.stock);
    }
    return Array.from(sizeStockMap.entries()).filter(([, stock]) => stock > 0).map(([size]) => size);
  }, [product, selectedColor]);

  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return product.variants.find((v) =>
      (selectedSize ? v.size === selectedSize : true) &&
      (selectedColor ? v.color === selectedColor : true) &&
      v.stock > 0
    ) || null;
  }, [product, selectedSize, selectedColor]);

  const maxQuantity = useMemo(() => {
    if (selectedVariant) return selectedVariant.stock;
    if (!product) return 1;
    if (selectedColor && selectedSize) {
      const v = product.variants.find((v) => v.size === selectedSize && v.color === selectedColor);
      return v ? v.stock : 0;
    }
    return product.total_stock || 1;
  }, [product, selectedVariant, selectedColor, selectedSize]);

  const displayImages = useMemo(() => {
    if (!product) return [];
    if (selectedColor) {
      const colorImgs = product.images.filter((img) => img.color === selectedColor);
      if (colorImgs.length > 0) return colorImgs;
    }
    const generalImgs = product.images.filter((img) => !img.color);
    return generalImgs.length > 0 ? generalImgs : product.images;
  }, [product, selectedColor]);

  if (isLoading) return <div className="container-custom py-20"><ProductGridSkeleton count={1} /></div>;
  if (!product) return <div className="container-custom py-20 text-center">Product not found</div>;

  const isWishlisted = wishlistItems.some((i) => i.product_id === product.id);
  const basePrice = product.sale_price || product.original_price;
  const variantExtra = selectedVariant ? Number(selectedVariant.additional_price) : 0;
  const effectivePrice = Number(basePrice) + variantExtra;
  const allSizes = [...new Set(product.variants.map((v) => v.size))];
  const allColors = [...new Set(product.variants.map((v) => v.color))];

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setQuantity(1);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setQuantity(1);
    setSelectedImage(0);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    if (allSizes.length > 0 && !selectedSize) { toast.error('Please select a size'); return; }
    if (allColors.length > 0 && !selectedColor) { toast.error('Please select a color'); return; }
    if (maxQuantity <= 0) { toast.error('Selected variant is out of stock'); return; }

    try {
      const { data } = await cartService.addToCart({
        product_id: product.id,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
        quantity,
      });
      dispatch(addCartItem(data));
      toast.success('Added to cart');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    try {
      if (isWishlisted) {
        await wishlistService.removeFromWishlist(product.id);
        dispatch(removeWishlistItem(product.id));
        toast.success('Removed from wishlist');
      } else {
        const { data } = await wishlistService.addToWishlist(product.id);
        dispatch(addWishlistItem(data));
        toast.success('Added to wishlist');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="container-custom py-8 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
        {/* Images */}
        <div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={displayImages[selectedImage]?.id || selectedColor} className="aspect-[3/4] bg-secondary-50 overflow-hidden mb-4">
            {displayImages[selectedImage] ? (
              <img src={displayImages[selectedImage].image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-secondary-300">No Image</div>
            )}
          </motion.div>
          {displayImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {displayImages.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 flex-shrink-0 border-2 overflow-hidden ${i === selectedImage ? 'border-secondary-900' : 'border-transparent'}`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="font-heading text-3xl md:text-4xl text-secondary-900 mb-2">{product.name}</h1>
          <p className="text-sm text-secondary-500 mb-4">SKU: {product.sku}</p>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl font-medium text-secondary-900">₹{effectivePrice.toLocaleString()}</span>
            {product.sale_price && (
              <>
                <span className="text-lg text-secondary-400 line-through">₹{(Number(product.original_price) + variantExtra).toLocaleString()}</span>
                <span className="text-sm text-primary-800 font-medium">-{product.discount_percent}%</span>
              </>
            )}
            {variantExtra > 0 && (
              <span className="text-xs text-secondary-400">(+₹{variantExtra.toLocaleString()} for {selectedColor})</span>
            )}
          </div>

          {product.avg_rating > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon key={star} className={`w-4 h-4 ${star <= Math.round(Number(product.avg_rating)) ? 'text-yellow-400 fill-yellow-400' : 'text-secondary-200'}`} />
                ))}
              </div>
              <span className="text-sm text-secondary-500">({product.review_count} reviews)</span>
            </div>
          )}

          {product.short_description && (
            <p className="text-sm text-secondary-600 leading-relaxed mb-6">{product.short_description}</p>
          )}

          {/* Size selection */}
          {allSizes.length > 0 && (
            <div className="mb-6">
              <p className="text-sm tracking-widest uppercase mb-3">Size</p>
              <div className="flex gap-2">
                {allSizes.map((size) => {
                  const isAvailable = inStockSizes.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => isAvailable && handleSizeSelect(size)}
                      disabled={!isAvailable}
                      className={`w-12 h-12 border text-sm flex items-center justify-center transition-colors ${
                        !isAvailable
                          ? 'border-secondary-100 text-secondary-300 cursor-not-allowed line-through bg-secondary-50'
                          : selectedSize === size
                            ? 'bg-secondary-900 text-white border-secondary-900'
                            : 'border-secondary-200 hover:border-secondary-900'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Color selection */}
          {inStockColors.length > 0 && (
            <div className="mb-6">
              <p className="text-sm tracking-widest uppercase mb-3">Color {selectedColor && `- ${selectedColor}`}</p>
              <div className="flex gap-2">
                {inStockColors.map((c) => (
                  <button
                    key={c.color}
                    onClick={() => handleColorSelect(c.color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === c.color ? 'border-secondary-900 scale-110' : 'border-secondary-200'
                    }`}
                    style={{ backgroundColor: c.hex || '#ccc' }}
                    title={c.color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-8">
            <p className="text-sm tracking-widest uppercase mb-3">
              Quantity {maxQuantity > 0 && <span className="text-xs text-secondary-400 normal-case tracking-normal">({maxQuantity} available)</span>}
            </p>
            <div className="flex items-center border border-secondary-200 w-fit">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} className="p-3 hover:bg-secondary-50 disabled:opacity-30 disabled:cursor-not-allowed">
                <MinusIcon className="w-4 h-4" />
              </button>
              <span className="px-6 text-sm">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))} disabled={quantity >= maxQuantity} className="p-3 hover:bg-secondary-50 disabled:opacity-30 disabled:cursor-not-allowed">
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mb-8">
            <button onClick={handleAddToCart} disabled={maxQuantity <= 0} className={`btn-primary flex-1 ${maxQuantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {maxQuantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button onClick={toggleWishlist} className="border border-secondary-200 p-3 hover:bg-secondary-50 transition-colors">
              {isWishlisted ? <HeartSolid className="w-5 h-5 text-red-500" /> : <HeartIcon className="w-5 h-5" />}
            </button>
          </div>

          {/* Description */}
          {product.description && (
            <div className="border-t border-secondary-100 pt-6">
              <h3 className="text-sm tracking-widest uppercase mb-3">Description</h3>
              <p className="text-sm text-secondary-600 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {reviews && reviews.items.length > 0 && (
        <section className="mt-16 border-t border-secondary-100 pt-12">
          <h2 className="section-title mb-8">Customer Reviews</h2>
          <div className="space-y-6 max-w-2xl">
            {reviews.items.map((review) => (
              <div key={review.id} className="border-b border-secondary-100 pb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-secondary-200'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-secondary-500">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
                {review.title && <h4 className="text-sm font-medium mb-1">{review.title}</h4>}
                {review.comment && <p className="text-sm text-secondary-600">{review.comment}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related */}
      {related && related.length > 0 && (
        <section className="mt-16 border-t border-secondary-100 pt-12">
          <h2 className="section-title mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
