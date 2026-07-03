import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bars3Icon, HeartIcon, MagnifyingGlassIcon, ShoppingBagIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAppSelector } from '../../hooks/useAppDispatch';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const cartItems = useAppSelector((s) => s.cart.items);
  const wishlistItems = useAppSelector((s) => s.wishlist.items);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-secondary-100">
      {/* Top bar */}
      <div className="bg-secondary-900 text-white text-center py-2 text-xs tracking-widest uppercase">
        Free Shipping on Orders Above ₹999
      </div>

      <nav className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile menu button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2">
            {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link to="/" className="font-heading text-2xl md:text-3xl tracking-wider text-secondary-900 uppercase">
            Joyara
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-8 text-sm tracking-widest uppercase">
            <Link to="/categories" className="hover:text-primary-600 transition-colors">Shop</Link>
            <Link to="/search?sort_by=newest" className="hover:text-primary-600 transition-colors">New Arrivals</Link>
            <Link to="/search?is_trending=true" className="hover:text-primary-600 transition-colors">Trending</Link>
            <Link to="/about" className="hover:text-primary-600 transition-colors">About</Link>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 hover:text-primary-600 transition-colors">
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
            <Link to={isAuthenticated ? '/profile' : '/login'} className="p-2 hover:text-primary-600 transition-colors hidden sm:block">
              <UserIcon className="w-5 h-5" />
            </Link>
            <Link to="/wishlist" className="p-2 hover:text-primary-600 transition-colors relative hidden sm:block">
              <HeartIcon className="w-5 h-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-600 text-white text-[10px] rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            <Link to="/cart" className="p-2 hover:text-primary-600 transition-colors relative">
              <ShoppingBagIcon className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-600 text-white text-[10px] rounded-full flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>
            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin" className="hidden md:block text-xs tracking-widest uppercase hover:text-primary-600">
                Admin
              </Link>
            )}
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-secondary-100 py-4">
            <form onSubmit={handleSearch} className="flex items-center max-w-xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="input-field flex-1"
                autoFocus
              />
              <button type="submit" className="btn-primary ml-2">Search</button>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-secondary-100 py-4 space-y-4">
            <Link to="/categories" onClick={() => setMobileOpen(false)} className="block text-sm tracking-widest uppercase py-2">Shop</Link>
            <Link to="/search?sort_by=newest" onClick={() => setMobileOpen(false)} className="block text-sm tracking-widest uppercase py-2">New Arrivals</Link>
            <Link to="/search?is_trending=true" onClick={() => setMobileOpen(false)} className="block text-sm tracking-widest uppercase py-2">Trending</Link>
            <Link to="/about" onClick={() => setMobileOpen(false)} className="block text-sm tracking-widest uppercase py-2">About</Link>
            <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="block text-sm tracking-widest uppercase py-2">Wishlist</Link>
            <Link to={isAuthenticated ? '/profile' : '/login'} onClick={() => setMobileOpen(false)} className="block text-sm tracking-widest uppercase py-2">
              {isAuthenticated ? 'Profile' : 'Login'}
            </Link>
            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="block text-sm tracking-widest uppercase py-2">Admin Panel</Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
