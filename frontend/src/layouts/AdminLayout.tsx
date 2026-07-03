import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bars3Icon,
  ChartBarIcon,
  CubeIcon,
  GiftIcon,
  HomeIcon,
  PhotoIcon,
  ShoppingCartIcon,
  TagIcon,
  UserGroupIcon,
  XMarkIcon,
  BellIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { logout } from '../store/slices/authSlice';

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: HomeIcon },
  { name: 'Products', path: '/admin/products', icon: CubeIcon },
  { name: 'Categories', path: '/admin/categories', icon: TagIcon },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingCartIcon },
  { name: 'Customers', path: '/admin/customers', icon: UserGroupIcon },
  { name: 'Coupons', path: '/admin/coupons', icon: GiftIcon },
  { name: 'Banners', path: '/admin/banners', icon: PhotoIcon },
  { name: 'Reports', path: '/admin/reports', icon: ChartBarIcon },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-secondary-900 text-white transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <Link to="/admin" className="font-heading text-xl tracking-wider uppercase">Joyara Admin</Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                location.pathname === item.path
                  ? 'bg-white/10 text-white'
                  : 'text-secondary-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-700">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-secondary-300 hover:text-white text-sm transition-colors">
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            Back to Store
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-secondary-300 hover:text-white text-sm transition-colors w-full">
            <ArrowLeftOnRectangleIcon className="w-5 h-5 rotate-180" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden">
            <Bars3Icon className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-medium text-secondary-900">
            {navItems.find((i) => i.path === location.pathname)?.name || 'Admin'}
          </h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-secondary-500 hover:text-secondary-900">
              <BellIcon className="w-5 h-5" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
