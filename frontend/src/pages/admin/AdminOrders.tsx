import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { orderService } from '../../services/orderService';
import { STATUS_COLORS, ORDER_STATUSES } from '../../constants';
import { TableSkeleton } from '../../components/common/Skeleton';

export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, statusFilter],
    queryFn: () => orderService.getAll(page, 20, statusFilter || undefined).then((r) => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ orderNumber, status }: { orderNumber: string; status: string }) =>
      orderService.updateStatus(orderNumber, { status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Status updated'); },
    onError: () => toast.error('Failed to update'),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Orders</h2>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-auto text-sm">
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading ? <TableSkeleton rows={8} /> : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Order</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Total</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium">{order.order_number}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">₹{Number(order.total_amount).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <select
                      value={order.status}
                      onChange={(e) => updateMutation.mutate({ orderNumber: order.order_number, status: e.target.value })}
                      className="text-xs border border-gray-200 rounded px-2 py-1"
                    >
                      {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data && data.total_pages > 1 && (
            <div className="flex justify-center gap-2 p-4">
              {Array.from({ length: data.total_pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 text-xs rounded ${p === page ? 'bg-secondary-900 text-white' : 'bg-gray-100'}`}>{p}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
