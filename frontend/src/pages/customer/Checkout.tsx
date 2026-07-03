import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { clearCart } from '../../store/slices/cartSlice';
import { userService } from '../../services/userService';
import { orderService } from '../../services/orderService';
import { couponService } from '../../services/couponService';
import type { Address } from '../../types';

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((s) => s.cart);
  const [manualAddress, setManualAddress] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    label: 'Home', full_name: '', phone: '', address_line1: '', city: '', state: '', postal_code: '', country: 'India',
  });

  const { data: addresses, refetch } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => userService.getAddresses().then((r) => r.data),
  });

  const selectedAddress = useMemo(() => {
    if (manualAddress) return manualAddress;
    if (addresses && addresses.length > 0) {
      const def = addresses.find((a) => a.is_default) || addresses[0];
      return def.id;
    }
    return '';
  }, [addresses, manualAddress]);

  const setSelectedAddress = (id: string) => setManualAddress(id);

  const subtotal = items.reduce((sum, item) => {
    const price = item.product?.sale_price || item.product?.original_price || 0;
    return sum + Number(price) * item.quantity;
  }, 0);

  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal - discount + shipping;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const { data } = await couponService.validate(couponCode, subtotal);
      setDiscount(data.discount_amount);
      toast.success(`Coupon applied! You save ₹${data.discount_amount}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error.response?.data?.detail || 'Invalid coupon');
      setDiscount(0);
    }
  };

  const handleAddAddress = async () => {
    try {
      await userService.createAddress(newAddress);
      refetch();
      setShowAddressForm(false);
      toast.success('Address added');
    } catch {
      toast.error('Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.error('Please select a shipping address'); return; }
    setLoading(true);
    try {
      const { data } = await orderService.create({
        items: items.map((i) => ({
          product_id: i.product_id,
          size: i.size || undefined,
          color: i.color || undefined,
          quantity: i.quantity,
        })),
        shipping_address_id: selectedAddress,
        payment_method: 'cod',
        coupon_code: couponCode || undefined,
      });
      dispatch(clearCart());
      navigate(`/order-success/${data.order_number}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container-custom py-8 md:py-16">
      <h1 className="section-title mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Addresses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm tracking-widest uppercase">Shipping Address</h3>
              <button onClick={() => setShowAddressForm(!showAddressForm)} className="text-sm text-primary-600 underline">
                {showAddressForm ? 'Cancel' : 'Add New'}
              </button>
            </div>

            {showAddressForm && (
              <div className="border border-secondary-100 p-4 mb-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input value={newAddress.full_name} onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })} placeholder="Full Name" className="input-field" />
                  <input value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} placeholder="Phone" className="input-field" />
                </div>
                <input value={newAddress.address_line1} onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })} placeholder="Address" className="input-field" />
                <div className="grid grid-cols-3 gap-3">
                  <input value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} placeholder="City" className="input-field" />
                  <input value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} placeholder="State" className="input-field" />
                  <input value={newAddress.postal_code} onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })} placeholder="Postal Code" className="input-field" />
                </div>
                <button onClick={handleAddAddress} className="btn-secondary text-sm">Save Address</button>
              </div>
            )}

            <div className="space-y-3">
              {addresses?.map((addr) => (
                <label key={addr.id} className={`block border p-4 cursor-pointer transition-colors ${selectedAddress === addr.id ? 'border-secondary-900' : 'border-secondary-100'}`}>
                  <div className="flex items-start gap-3">
                    <input type="radio" name="address" checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} className="mt-1" />
                    <div>
                      <p className="text-sm font-medium">{addr.full_name} <span className="text-xs text-secondary-400">({addr.label})</span></p>
                      <p className="text-xs text-secondary-500 mt-1">{addr.address_line1}, {addr.city}, {addr.state} - {addr.postal_code}</p>
                      <p className="text-xs text-secondary-500">{addr.phone}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Coupon */}
          <div>
            <h3 className="text-sm tracking-widest uppercase mb-4">Coupon Code</h3>
            <div className="flex gap-2">
              <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Enter coupon code" className="input-field flex-1" />
              <button onClick={handleApplyCoupon} className="btn-secondary">Apply</button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="border border-secondary-100 p-6 h-fit sticky top-24">
          <h3 className="text-sm tracking-widest uppercase mb-6">Order Summary</h3>
          <div className="space-y-3 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-secondary-600 truncate pr-2">{item.product?.name} x{item.quantity}</span>
                <span>₹{(Number(item.product?.sale_price || item.product?.original_price || 0) * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="space-y-3 text-sm border-t border-secondary-100 pt-3">
            <div className="flex justify-between"><span className="text-secondary-500">Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
            {discount > 0 && <div className="flex justify-between text-success"><span>Discount</span><span>-₹{discount.toLocaleString()}</span></div>}
            <div className="flex justify-between"><span className="text-secondary-500">Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
            <div className="border-t border-secondary-100 pt-3 flex justify-between font-medium text-base">
              <span>Total</span><span>₹{total.toLocaleString()}</span>
            </div>
          </div>
          <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary w-full mt-6 disabled:opacity-50">
            {loading ? 'Placing Order...' : 'Place Order (COD)'}
          </button>
        </div>
      </div>
    </div>
  );
}
