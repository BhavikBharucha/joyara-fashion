import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import ProductCard from '../components/common/ProductCard';
import { ProductGridSkeleton } from '../components/common/Skeleton';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';

export default function Home() {
  const { data: featured, isLoading: loadingFeatured } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productService.getFeatured().then((r) => r.data),
  });

  const { data: newArrivals, isLoading: loadingNew } = useQuery({
    queryKey: ['new-arrivals'],
    queryFn: () => productService.getNewArrivals().then((r) => r.data),
  });

  const { data: trending, isLoading: loadingTrending } = useQuery({
    queryKey: ['trending-products'],
    queryFn: () => productService.getTrending().then((r) => r.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['featured-categories'],
    queryFn: () => categoryService.getFeatured().then((r) => r.data),
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[85vh] bg-secondary-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-900/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80')] bg-cover bg-center" />
        <div className="relative z-20 container-custom h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg"
          >
            <h1 className="font-heading text-4xl md:text-6xl text-white leading-tight mb-4">
              Elegance<br />Redefined
            </h1>
            <p className="text-white/80 text-sm md:text-base mb-8 leading-relaxed">
              Discover curated collections that blend timeless sophistication with contemporary style.
            </p>
            <Link to="/search" className="inline-flex items-center gap-2 bg-white text-secondary-900 px-8 py-3 text-sm tracking-widest uppercase hover:bg-secondary-100 transition-colors">
              Shop Collection
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container-custom">
            <h2 className="section-title text-center mb-12">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/search?category_id=${cat.id}`}
                  className="group relative aspect-[3/4] overflow-hidden bg-secondary-50"
                >
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-secondary-100" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-white font-heading text-xl">{cat.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-secondary-50/50">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-12">
            <h2 className="section-title">Featured</h2>
            <Link to="/search?is_featured=true" className="text-sm tracking-widest uppercase text-secondary-600 hover:text-secondary-900 flex items-center gap-2">
              View All <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          {loadingFeatured ? (
            <ProductGridSkeleton />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featured?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Banner */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="relative h-[300px] md:h-[400px] bg-secondary-100 overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=80')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-secondary-900/40" />
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
              <h2 className="font-heading text-3xl md:text-5xl text-white mb-4">Summer Collection</h2>
              <p className="text-white/80 mb-6 text-sm">Up to 40% off on selected styles</p>
              <Link to="/search" className="btn-secondary border-white text-white hover:bg-white hover:text-secondary-900">
                Explore Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 md:py-24 bg-secondary-50/50">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-12">
            <h2 className="section-title">New Arrivals</h2>
            <Link to="/search?sort_by=newest" className="text-sm tracking-widest uppercase text-secondary-600 hover:text-secondary-900 flex items-center gap-2">
              View All <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          {loadingNew ? (
            <ProductGridSkeleton />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {newArrivals?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trending */}
      {trending && trending.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-12">
              <h2 className="section-title">Trending Now</h2>
              <Link to="/search?is_trending=true" className="text-sm tracking-widest uppercase text-secondary-600 hover:text-secondary-900 flex items-center gap-2">
                View All <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
            {loadingTrending ? (
              <ProductGridSkeleton />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {trending?.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-16 border-t border-secondary-100">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { title: 'Free Shipping', desc: 'On orders above ₹999' },
              { title: 'Easy Returns', desc: '7-day return policy' },
              { title: 'Secure Payment', desc: '100% secure checkout' },
              { title: 'Premium Quality', desc: 'Handpicked fabrics' },
            ].map((f) => (
              <div key={f.title}>
                <h4 className="text-sm tracking-widest uppercase text-secondary-900 mb-2">{f.title}</h4>
                <p className="text-xs text-secondary-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
