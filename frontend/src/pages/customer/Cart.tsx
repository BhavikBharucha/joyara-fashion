import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { removeCartItem, setCartItems, updateCartItem } from '../../store/slices/cartSlice';
import { cartService } from '../../services/cartService';

export default function Cart() {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((s) => s.cart);
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (isAuthenticated) {
      cartService.getCart().then((r) => dispatch(setCartItems(r.data)));
    }
  }, [isAuthenticated, dispatch]);

  const handleUpdateQty = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      const { data } = await cartService.updateItem(itemId, quantity);
      dispatch(updateCartItem(data));
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await cartService.removeItem(itemId);
      dispatch(removeCartItem(itemId));
      toast.success('Removed from cart');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const subtotal = items.reduce((sum, item) => {
    const price = item.product?.sale_price || item.product?.original_price || 0;
    return sum + Number(price) * item.quantity;
  }, 0);

  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;

  if (!isAuthenticated) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="section-title mb-4">Your Cart</h1>
        <p className="text-secondary-500 mb-6">Please login to view your cart</p>
        <Link to="/login" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="section-title mb-4">Your Cart is Empty</h1>
        <p className="text-secondary-500 mb-6">Looks like you haven't added anything yet</p>
        <Link to="/search" className="btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 md:py-16">
      <h1 className="section-title mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const price = item.product?.sale_price || item.product?.original_price || 0;
            const image = item.product?.images?.[0]?.image_url;
            return (
              <div key={item.id} className="flex gap-4 p-4 border border-secondary-100">
                <div className="w-24 h-32 bg-secondary-50 flex-shrink-0 overflow-hidden">
                  {image ? (
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-secondary-300 text-xs">No Image</div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-secondary-900">{item.product?.name || 'Product'}</h3>
                  {(item.size || item.color) && (
                    <p className="text-xs text-secondary-500 mt-1">
                      {item.size && `Size: ${item.size}`} {item.color && `Color: ${item.color}`}
                    </p>
                  )}
                  <p className="text-sm font-medium mt-2">₹{Number(price).toLocaleString()}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-secondary-200">
                      <button onClick={() => handleUpdateQty(item.id, item.quantity - 1)} className="p-2">
                        <MinusIcon className="w-3 h-3" />
                      </button>
                      <span className="px-4 text-sm">{item.quantity}</span>
                      <button onClick={() => handleUpdateQty(item.id, item.quantity + 1)} className="p-2">
                        <PlusIcon className="w-3 h-3" />
                      </button>
                    </div>
                    <button onClick={() => handleRemove(item.id)} className="text-secondary-400 hover:text-error">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border border-secondary-100 p-6 h-fit sticky top-24">
          <h3 className="text-sm tracking-widest uppercase mb-6">Order Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-secondary-500">Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-500">Shipping</span>
              <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
            </div>
            <div className="border-t border-secondary-100 pt-3 flex justify-between font-medium">
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
          </div>
          <Link to="/checkout" className="btn-primary w-full text-center block mt-6">
            Proceed to Checkout
          </Link>
          <Link to="/search" className="block text-center text-sm text-secondary-500 underline mt-4">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
