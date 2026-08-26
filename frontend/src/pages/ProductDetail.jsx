import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';
import Spinner from '../components/Spinner.jsx';
import Button from '../components/Button.jsx';
import { Input, Select } from '../components/Input.jsx';

const IMAGE_KEYS = ['main', 'pic1', 'pic2', 'pic3', 'pic4', 'pic5', 'pic6', 'pic7', 'pic8', 'pic9', 'pic10'];

// Ports the {% now 'd' %}/{% now 'm' %}/{% now 'y' %} hidden field from product.html
// (Django zero-pads day/month and uses a 2-digit year).
function formatOrderDate(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = String(date.getFullYear()).slice(-2);
  return `${d}/${m}/${y}`;
}

// Static testimonials ported verbatim from the "Testimonial on this product" section
// of product.html — the Testimonial model is unused by any view, so this content is
// hardcoded there too, not DB-driven.
const TESTIMONIALS = [
  {
    image: '/images/testimonials/Ai1.PNG',
    quote:
      'I recently purchased a stunning custom-designed door from Indoor Axe for my new home. The craftsmanship is impeccable, and it adds a touch of elegance to my living space. Highly recommend their doors for anyone looking for quality and style!',
    name: 'Sudhir Kumar, Bhubaneswar, Odisha',
    stars: 4,
  },
  {
    image: '/images/testimonials/Ai2.PNG',
    quote:
      'Indoor Axe exceeded my expectations with their door design and quality. The attention to detail is remarkable. My new door not only enhances the aesthetics of my home but also provides top-notch security. Fantastic job!',
    name: 'Pradeep Nayak, Balasore, Odisha',
    stars: 3,
  },
  {
    image: '/images/testimonials/Ai3.PNG',
    quote:
      'Indoor Axe doors are a perfect combination of style and durability. I bought a set of doors for my industrial unit, and they have proven to be an excellent investment. The doors have stood the test of time and are still as good as new.',
    name: 'Pradeep Nayak, Balasore, Odisha',
    stars: 4,
  },
  {
    image: '/images/testimonials/Ai4.PNG',
    quote:
      "I am extremely satisfied with the door I purchased from Indoor Axe. The durability and strength of the door are impressive. Living in a coastal area, it's crucial to have a door that can withstand the elements, and Indoor Axe delivered exactly that.",
    name: 'Alok Mishra, Puri, Odisha',
    stars: 2,
  },
];

function Stars({ count }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < count ? 'text-brand-accent' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [deliveryCharges, setDeliveryCharges] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  const [activeImage, setActiveImage] = useState('');

  const [qty, setQty] = useState('');
  const [length, setLength] = useState('1');
  const [breadth, setBreadth] = useState('1');
  const [addonId, setAddonId] = useState('');
  const [statePrice, setStatePrice] = useState('');
  const [orderDate, setOrderDate] = useState(() => formatOrderDate(new Date()));

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    setNotFound(false);

    api
      .get(`/products/${slug}`)
      .then(({ data }) => {
        if (cancelled) return;
        setProduct(data.product);
        setDeliveryCharges(data.deliveryCharges || []);
        setRelatedProducts(data.relatedProducts || []);
        const images = data.product?.images || {};
        const firstImage = IMAGE_KEYS.map((key) => images[key]).find(Boolean) || '';
        setActiveImage(firstImage);
        // Reset the form for the newly-loaded product.
        setQty('');
        setLength('1');
        setBreadth('1');
        setAddonId('');
        setStatePrice('');
        setOrderDate(formatOrderDate(new Date()));
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.response?.status === 404) setNotFound(true);
        else setError('Could not load this product right now. Please try again shortly.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const gallery = useMemo(() => {
    if (!product?.images) return [];
    return IMAGE_KEYS.map((key) => product.images[key]).filter(Boolean);
  }, [product]);

  const isAccessory = product?.productType === 'Accessories';

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');

    if (!statePrice) {
      setSubmitError('Please select your delivery state.');
      return;
    }
    if (!qty || Number(qty) <= 0) {
      setSubmitError('Please enter a valid quantity.');
      return;
    }
    if (!isAccessory && (Number(length) <= 0 || Number(breadth) <= 0)) {
      setSubmitError('Please enter valid opening height and width.');
      return;
    }

    const payload = {
      qty: Number(qty),
      length: isAccessory ? 1 : Number(length),
      breadth: isAccessory ? 1 : Number(breadth),
      statePrice,
      addonId: isAccessory ? '' : addonId,
    };
    if (!isAccessory) payload.orderDate = orderDate;

    setSubmitting(true);
    try {
      const { data } = await api.post(`/orders/from-product/${slug}`, payload);
      navigate(`/checkout/${data.order.slug}`);
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Could not create the order. Please check your inputs and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner label="Loading product…" />;

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
        <p className="mt-3 text-gray-500">This product may have been removed or the link is incorrect.</p>
        <Link to="/products" className="mt-6 inline-block text-brand hover:underline">
          ← Back to Products
        </Link>
      </div>
    );
  }

  if (error) {
    return <div className="mx-auto max-w-3xl px-4 py-24 text-center text-red-600">{error}</div>;
  }

  if (!product) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
            {activeImage ? (
              <img src={activeImage} alt={product.name} className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-300">No image</div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(src)}
                  className={`h-20 w-20 overflow-hidden rounded-md border-2 ${
                    activeImage === src ? 'border-brand-accent' : 'border-gray-200'
                  }`}
                >
                  <img src={src} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details + form */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-accent">{product.productType}</span>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">{product.name}</h1>

          {product.seoDescription && <p className="mt-4 text-gray-600">{product.seoDescription}</p>}

          <h2 className="mt-4 text-xl font-semibold text-gray-900">Starting at: ₹{product.startPrice}</h2>
          {product.startPriceWritten && <p className="text-sm text-gray-500">{product.startPriceWritten}</p>}
          {product.pricePerSqft ? (
            <p className="mt-1 text-sm text-gray-500">₹{product.pricePerSqft} per sq. ft.</p>
          ) : null}

          {/* "Also comes with" — accessories strip */}
          {relatedProducts.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900">Also comes with</h3>
              <div className="mt-3 flex gap-4 overflow-x-auto pb-2">
                {relatedProducts.map((p) => (
                  <div key={p._id} className="flex w-32 flex-shrink-0 flex-col items-center rounded-md border border-gray-200 p-2">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded bg-gray-100">
                      {p.images?.main ? (
                        <img src={p.images.main} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs text-gray-300">No image</span>
                      )}
                    </div>
                    <h5 className="mt-2 text-center text-xs font-medium text-gray-700">{p.name}</h5>
                    <p className="text-sm font-semibold text-gray-900">₹{p.pricePerSqft}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estimator form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-lg border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900">Check Estimate Price</h3>

            <Input
              label="Quantity"
              type="number"
              min="1"
              required
              placeholder="Enter Quantity"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />

            {!isAccessory && (
              <>
                <Input
                  label="Structural Opening Height in Feet"
                  type="number"
                  min="1"
                  required
                  placeholder="Enter Structural Opening Height in Feet"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                />
                <Input
                  label="Structural Opening Width in Feet"
                  type="number"
                  min="1"
                  required
                  placeholder="Enter Structural Opening Width in Feet"
                  value={breadth}
                  onChange={(e) => setBreadth(e.target.value)}
                />
                <Select label="Addon" value={addonId} onChange={(e) => setAddonId(e.target.value)}>
                  <option value="">Select Accessories</option>
                  {relatedProducts.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Order Date"
                  type="text"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                />
              </>
            )}

            <Select label="State" required value={statePrice} onChange={(e) => setStatePrice(e.target.value)}>
              <option value="">Select State</option>
              {deliveryCharges.map((d) => (
                <option key={d._id} value={d.price}>
                  {d.state}
                </option>
              ))}
            </Select>

            {submitError && <p className="text-sm text-red-600">{submitError}</p>}

            <Button type="submit" variant="accent" disabled={submitting} className="w-full">
              {submitting ? 'Please wait…' : 'Check Estimate Price'}
            </Button>
          </form>
        </div>
      </div>

      {/* Testimonials */}
      <section className="mt-16 border-t border-gray-200 pt-12">
        <h2 className="text-center text-2xl font-bold text-gray-900">Testimonial on this product</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="flex gap-4 rounded-lg border border-gray-200 p-4">
              <img src={t.image} alt={t.name} className="h-16 w-16 flex-shrink-0 rounded-full object-cover" />
              <div>
                <p className="text-sm text-gray-600">{t.quote}</p>
                <h4 className="mt-2 text-sm font-semibold text-gray-900">{t.name}</h4>
                <Stars count={t.stars} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
