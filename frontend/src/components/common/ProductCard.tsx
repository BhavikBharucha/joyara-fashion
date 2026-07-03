import { Link } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import type { ProductListItem } from '../../types';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { addWishlistItem, removeWishlistItem } from '../../store/slices/wishlistSlice';
import { wishlistService } from '../../services/wishlistService';

interface Props {
  product: ProductListItem;
}

export default function ProductCard({ product }: Props) {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const wishlistItems = useAppSelector((s) => s.wishlist.items);
  const isWishlisted = wishlistItems.some((i) => i.product_id === product.id);

  const primaryImage = product.images?.find((i) => i.is_primary) || product.images?.[0];
  const effectivePrice = product.sale_price || product.original_price;

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link to={`/product/${product.slug}`} className="group block">
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary-50">
          {primaryImage ? (
            <img
              src={primaryImage.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-secondary-300">
              <span className="text-sm">No Image</span>
            </div>
          )}

          {/* Wishlist button */}
          <button
            onClick={toggleWishlist}
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            {isWishlisted ? (
              <HeartSolid className="w-4 h-4 text-red-500" />
            ) : (
              <HeartIcon className="w-4 h-4 text-secondary-600" />
            )}
          </button>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.discount_percent > 0 && (
              <span className="bg-primary-600 text-white text-[10px] tracking-wider uppercase px-2 py-1">
                -{product.discount_percent}%
              </span>
            )}
            {product.is_new_arrival && (
              <span className="bg-secondary-900 text-white text-[10px] tracking-wider uppercase px-2 py-1">
                New
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <h3 className="text-sm text-secondary-900 truncate">{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-secondary-900">
              ₹{Number(effectivePrice).toLocaleString()}
            </span>
            {product.sale_price && (
              <span className="text-xs text-secondary-400 line-through">
                ₹{Number(product.original_price).toLocaleString()}
              </span>
            )}
          </div>
          {product.avg_rating > 0 && (
            <div className="flex items-center gap-1 text-xs text-secondary-500">
              <span className="text-yellow-500">★</span>
              <span>{Number(product.avg_rating).toFixed(1)}</span>
              <span>({product.review_count})</span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
