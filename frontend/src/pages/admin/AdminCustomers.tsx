import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../../services/userService';
import { TableSkeleton } from '../../components/common/Skeleton';

export default function AdminCustomers() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', page],
    queryFn: () => userService.getCustomers(page).then((r) => r.data),
  });

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Customers</h2>
      {isLoading ? <TableSkeleton rows={8} /> : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Phone</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((user) => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium">{user.first_name} {user.last_name}</td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{user.phone || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{new Date(user.created_at).toLocaleDateString()}</td>
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
