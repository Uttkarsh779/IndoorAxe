import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import Spinner from '../components/Spinner.jsx';
import ProductCard from '../components/ProductCard.jsx';

// Must match the backend `productType` enum exactly (models/Product.js PRODUCT_TYPES).
const PRODUCT_TYPES = ['Commercial', 'Residential', 'Window', 'Fire Hose & Cabinets', 'Accessories', 'Others'];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeType, setActiveType] = useState('All');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const url = activeType === 'All' ? '/products' : `/products?type=${encodeURIComponent(activeType)}`;
    api
      .get(url)
      .then(({ data }) => {
        if (!cancelled) setProducts(data.products || []);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load products right now. Please try again shortly.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeType]);

  const filters = useMemo(() => ['All', ...PRODUCT_TYPES], []);

  return (
    <div>
      {/* Banner (ports the dark banner-area heading from products.html) */}
      <section className="bg-brand py-16 text-center text-white">
        <div className="mx-auto max-w-5xl px-4">
          <h1 className="text-4xl font-bold">Products</h1>
          <p className="mt-3 text-sm text-gray-300">
            <Link to="/" className="hover:text-brand-accent">
              Home
            </Link>{' '}
            <span className="mx-1">›</span> Products
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Filter tabs for the 6 product types + All */}
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {filters.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setActiveType(type)}
              className={`rounded-full border px-5 py-2 text-sm font-semibold uppercase tracking-wide transition-colors ${
                activeType === type
                  ? 'border-brand-accent bg-brand-accent text-black'
                  : 'border-gray-300 text-gray-600 hover:border-brand-accent hover:text-brand-accent'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {loading && <Spinner label="Loading products…" />}

        {!loading && error && <p className="text-center text-red-600">{error}</p>}

        {!loading && !error && products.length === 0 && (
          <p className="text-center text-gray-500">No products found in this category yet.</p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
