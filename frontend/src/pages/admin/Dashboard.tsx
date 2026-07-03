import { useQuery } from '@tanstack/react-query';
import { CubeIcon, CurrencyRupeeIcon, ShoppingCartIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { dashboardService } from '../../services/dashboardService';
import { STATUS_COLORS } from '../../constants';
import { TableSkeleton } from '../../components/common/Skeleton';

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getStats().then((r) => r.data),
  });

  if (isLoading) return <TableSkeleton rows={8} />;

  const statCards = [
    { label: 'Total Revenue', value: `₹${stats?.total_revenue?.toLocaleString() || 0}`, icon: CurrencyRupeeIcon, color: 'bg-green-50 text-green-600' },
    { label: 'Total Orders', value: stats?.total_orders || 0, icon: ShoppingCartIcon, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Products', value: stats?.total_products || 0, icon: CubeIcon, color: 'bg-purple-50 text-purple-600' },
    { label: 'Total Customers', value: stats?.total_users || 0, icon: UserGroupIcon, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-medium mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {stats?.recent_orders.length === 0 ? (
              <p className="text-sm text-gray-500">No orders yet</p>
            ) : (
              stats?.recent_orders.map((order) => (
                <div key={order.order_number} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <div>
                    <p className="text-sm font-medium">{order.order_number}</p>
                    <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
                      {order.status}
                    </span>
                    <span className="text-sm font-medium">₹{order.total_amount.toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-medium mb-4">Monthly Revenue</h3>
          <div className="space-y-3">
            {stats?.monthly_revenue.length === 0 ? (
              <p className="text-sm text-gray-500">No revenue data yet</p>
            ) : (
              stats?.monthly_revenue.map((m) => (
                <div key={m.month} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm">{m.month}</span>
                  <div className="text-right">
                    <p className="text-sm font-medium">₹{m.revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{m.orders} orders</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pending Orders */}
      {stats && stats.pending_orders > 0 && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6">
          <p className="text-sm text-yellow-800">
            You have <strong>{stats.pending_orders}</strong> pending orders that need attention.
          </p>
        </div>
      )}
    </div>
  );
}
