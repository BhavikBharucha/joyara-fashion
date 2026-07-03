import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboardService';
import { TableSkeleton } from '../../components/common/Skeleton';

export default function AdminReports() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats-report'],
    queryFn: () => dashboardService.getStats().then((r) => r.data),
  });

  if (isLoading) return <TableSkeleton rows={10} />;

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Reports & Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">Revenue Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Total Revenue</span><span className="font-medium">₹{stats?.total_revenue?.toLocaleString() || 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Total Orders</span><span className="font-medium">{stats?.total_orders || 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Avg Order Value</span><span className="font-medium">₹{stats?.total_orders ? Math.round(stats.total_revenue / stats.total_orders).toLocaleString() : 0}</span></div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">Overview</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Total Products</span><span className="font-medium">{stats?.total_products || 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Total Customers</span><span className="font-medium">{stats?.total_users || 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Pending Orders</span><span className="font-medium">{stats?.pending_orders || 0}</span></div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-medium mb-4">Monthly Revenue</h3>
        {stats?.monthly_revenue.length === 0 ? (
          <p className="text-sm text-gray-500">No data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Month</th>
                  <th className="text-right py-2 font-medium">Revenue</th>
                  <th className="text-right py-2 font-medium">Orders</th>
                </tr>
              </thead>
              <tbody>
                {stats?.monthly_revenue.map((m) => (
                  <tr key={m.month} className="border-b border-gray-50">
                    <td className="py-2">{m.month}</td>
                    <td className="py-2 text-right">₹{m.revenue.toLocaleString()}</td>
                    <td className="py-2 text-right">{m.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
