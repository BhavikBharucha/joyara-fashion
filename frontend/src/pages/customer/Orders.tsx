import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { orderService } from '../../services/orderService';
import { STATUS_COLORS } from '../../constants';
import { TableSkeleton } from '../../components/common/Skeleton';

export default function Orders() {
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['my-orders', page],
    queryFn: () => orderService.getMyOrders(page).then((r) => r.data),
  });

  const handleCancel = async (orderNumber: string) => {
    if (!confirm('Cancel this order?')) return;
    try {
      await orderService.cancel(orderNumber);
      toast.success('Order cancelled');
      refetch();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error.response?.data?.detail || 'Failed to cancel');
    }
  };

  return (
    <div className="container-custom py-8 md:py-16">
      <h1 className="section-title mb-8">My Orders</h1>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : data?.items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-secondary-500 mb-6">You haven't placed any orders yet</p>
          <Link to="/search" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.items.map((order) => (
            <div key={order.id} className="border border-secondary-100 p-4 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium">{order.order_number}</p>
                  <p className="text-xs text-secondary-500">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-medium">₹{Number(order.total_amount).toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    {item.product_image && (
                      <img src={item.product_image} alt="" className="w-12 h-12 object-cover" />
                    )}
                    <div className="flex-1">
                      <p>{item.product_name}</p>
                      <p className="text-xs text-secondary-500">
                        Qty: {item.quantity} {item.size && `| ${item.size}`} {item.color && `| ${item.color}`}
                      </p>
                    </div>
                    <span>₹{Number(item.total_price).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              {['pending', 'confirmed'].includes(order.status) && (
                <button onClick={() => handleCancel(order.order_number)} className="text-sm text-error underline">
                  Cancel Order
                </button>
              )}
            </div>
          ))}

          {data && data.total_pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: data.total_pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 text-sm ${p === page ? 'bg-secondary-900 text-white' : 'border border-secondary-200'}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
