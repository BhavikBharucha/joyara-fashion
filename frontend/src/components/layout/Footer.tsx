import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-primary-800 text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <img src="/logo.png" alt="Joyara" className="h-12 w-auto mb-4 brightness-0 invert" />
            <p className="text-secondary-300 text-sm leading-relaxed">
              Curated women's fashion that celebrates elegance, comfort, and modern style.
            </p>
          </div>
          <div>
            <h4 className="text-sm tracking-widest uppercase mb-4">Quick Links</h4>
            <div className="space-y-3">
              <Link to="/categories" className="block text-secondary-300 text-sm hover:text-white transition-colors">Shop All</Link>
              <Link to="/search?sort_by=newest" className="block text-secondary-300 text-sm hover:text-white transition-colors">New Arrivals</Link>
              <Link to="/search?is_trending=true" className="block text-secondary-300 text-sm hover:text-white transition-colors">Trending</Link>
              <Link to="/about" className="block text-secondary-300 text-sm hover:text-white transition-colors">About Us</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm tracking-widest uppercase mb-4">Customer Care</h4>
            <div className="space-y-3">
              <Link to="/contact" className="block text-secondary-300 text-sm hover:text-white transition-colors">Contact Us</Link>
              <Link to="/privacy" className="block text-secondary-300 text-sm hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="block text-secondary-300 text-sm hover:text-white transition-colors">Terms & Conditions</Link>
              <Link to="/orders" className="block text-secondary-300 text-sm hover:text-white transition-colors">Track Order</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm tracking-widest uppercase mb-4">Newsletter</h4>
            <p className="text-secondary-300 text-sm mb-4">Subscribe for exclusive offers and updates.</p>
            <form className="flex" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-primary-900 border border-primary-700 px-4 py-2 text-sm focus:outline-none focus:border-white transition-colors"
              />
              <button className="bg-white text-secondary-900 px-4 py-2 text-sm tracking-widest uppercase hover:bg-secondary-100 transition-colors">
                Join
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-primary-700 mt-12 pt-8 text-center text-primary-200 text-xs tracking-wider">
          &copy; {new Date().getFullYear()} Joyara Fashion. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
