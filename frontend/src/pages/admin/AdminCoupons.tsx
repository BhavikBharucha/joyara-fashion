import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { couponService } from '../../services/couponService';
import { TableSkeleton } from '../../components/common/Skeleton';

export default function AdminCoupons() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '', description: '', discount_type: 'percentage', discount_value: '', min_order_amount: '0',
    max_discount_amount: '', usage_limit: '', starts_at: '', expires_at: '', is_active: true,
  });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => couponService.getAll().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => couponService.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-coupons'] }); setShowForm(false); toast.success('Coupon created'); },
    onError: () => toast.error('Failed to create'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => couponService.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-coupons'] }); toast.success('Coupon deleted'); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      discount_value: parseFloat(form.discount_value),
      min_order_amount: parseFloat(form.min_order_amount) || 0,
      max_discount_amount: form.max_discount_amount ? parseFloat(form.max_discount_amount) : null,
      usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Coupons</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
          <PlusIcon className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Coupon Code *" className="input-field" required />
            <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="input-field">
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="input-field" />
          <div className="grid grid-cols-3 gap-4">
            <input value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} placeholder="Discount Value *" type="number" className="input-field" required />
            <input value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} placeholder="Min Order Amount" type="number" className="input-field" />
            <input value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} placeholder="Usage Limit" type="number" className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} type="datetime-local" className="input-field" required />
            <input value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} type="datetime-local" className="input-field" required />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">Create Coupon</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {isLoading ? <TableSkeleton /> : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Code</th>
                <th className="text-left px-4 py-3 font-medium">Discount</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Usage</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((coupon) => (
                <tr key={coupon.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 font-medium">{coupon.code}</td>
                  <td className="px-4 py-3">{coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{coupon.used_count}{coupon.usage_limit ? `/${coupon.usage_limit}` : ''}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(coupon.id); }} className="p-1.5 text-gray-400 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
