import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { setWishlistItems } from '../../store/slices/wishlistSlice';
import { wishlistService } from '../../services/wishlistService';
import ProductCard from '../../components/common/ProductCard';

export default function Wishlist() {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((s) => s.wishlist);
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (isAuthenticated) {
      wishlistService.getWishlist().then((r) => dispatch(setWishlistItems(r.data)));
    }
  }, [isAuthenticated, dispatch]);

  if (!isAuthenticated) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="section-title mb-4">Your Wishlist</h1>
        <p className="text-secondary-500 mb-6">Please login to view your wishlist</p>
        <Link to="/login" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="section-title mb-4">Your Wishlist is Empty</h1>
        <p className="text-secondary-500 mb-6">Save your favorite items for later</p>
        <Link to="/search" className="btn-primary">Explore Products</Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 md:py-16">
      <h1 className="section-title mb-8">Wishlist ({items.length})</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {items.map((item) => (
          <ProductCard key={item.id} product={item.product} />
        ))}
      </div>
    </div>
  );
}
