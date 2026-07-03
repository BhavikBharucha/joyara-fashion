import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { categoryService } from '../services/categoryService';
import { TableSkeleton } from '../components/common/Skeleton';

export default function Categories() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['all-categories'],
    queryFn: () => categoryService.getActive().then((r) => r.data),
  });

  if (isLoading) return <div className="container-custom py-16"><TableSkeleton rows={6} /></div>;

  return (
    <div className="container-custom py-8 md:py-16">
      <h1 className="section-title text-center mb-12">Shop by Category</h1>
      {categories && categories.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/search?category_id=${cat.id}`}
              className="group relative aspect-[3/4] overflow-hidden bg-secondary-50"
            >
              {cat.image_url ? (
                <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full bg-secondary-100 flex items-center justify-center">
                  <span className="font-heading text-2xl text-secondary-300">{cat.name[0]}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-heading text-xl">{cat.name}</h3>
                {cat.description && <p className="text-white/70 text-xs mt-1 line-clamp-2">{cat.description}</p>}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-secondary-500">No categories available yet</p>
      )}
    </div>
  );
}
