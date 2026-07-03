import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { bannerService } from '../../services/bannerService';
import { TableSkeleton } from '../../components/common/Skeleton';

export default function AdminBanners() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => bannerService.getAll().then((r) => r.data),
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    try {
      await bannerService.delete(id);
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      toast.success('Banner deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Banners</h2>
      {isLoading ? <TableSkeleton /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.items?.map((banner: { id: string; title: string; subtitle: string | null; image_url: string; position: string; is_active: boolean }) => (
            <div key={banner.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <img src={banner.image_url} alt={banner.title} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h3 className="font-medium">{banner.title}</h3>
                <p className="text-sm text-gray-500">{banner.subtitle}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400">{banner.position}</span>
                  <button onClick={() => handleDelete(banner.id)} className="text-red-500 hover:text-red-700">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )) || <p className="text-gray-500">No banners yet</p>}
        </div>
      )}
    </div>
  );
}
