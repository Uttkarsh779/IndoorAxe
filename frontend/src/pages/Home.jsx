import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import Button from '../components/Button.jsx';
import ProductCard from '../components/ProductCard.jsx';
import BlogCard from '../components/BlogCard.jsx';
import Spinner from '../components/Spinner.jsx';

const FEATURES = [
  {
    title: 'Value for Money',
    desc: 'Superior products at reasonable prices',
  },
  {
    title: 'Fire-resistant',
    desc: 'Since Indoor Axe doors are made of steel they automatically resist fire',
  },
  {
    title: 'Weather-proof',
    desc: 'High quality of steel lasts long and endures every weather condition',
  },
  {
    title: 'Termite-resistant',
    desc: 'Indoor Axe doors are made of steel which is naturally resistant to termites',
  },
  {
    title: 'Longevity',
    desc: 'Indoor Axe doors comes with 1 years warranty. However, wooden doors fade away in 2-3 years',
  },
  {
    title: 'Environment Friendly',
    desc: 'No trees are cut in the making of Indoor Axe Doors and Windows.',
  },
];

const SHOWCASES = [
  { id: 1, title: 'Center Point (Riyadh)', image: '/images/project-1.png' },
  { id: 2, title: 'Jeddah Street Circuit (Jeddah)', image: '/images/project-2.png' },
  { id: 3, title: 'Burj Al Arab (Dubai)', image: '/images/project-3.png' },
  { id: 4, title: 'JW Marriott Marquis Hotel (Dubai)', image: '/images/project-4.png' },
  { id: 5, title: 'Al Jawahar (Riyadh)', image: '/images/project-5.png' },
  { id: 6, title: 'Riyadh Gallery Mall (Riyadh)', image: '/images/project-6.png' },
];

const TESTIMONIALS = [
  {
    quote:
      "I recently purchased a stunning custom-designed door from Indoor Axe for my new home. The craftsmanship is impeccable, and it adds a touch of elegance to my living space. Highly recommend their doors for anyone looking for quality and style!",
    name: 'Sudhir Kumar, Bhubaneswar, Odisha',
    stars: 4,
  },
  {
    quote:
      "Indoor Axe exceeded my expectations with their door design and quality. The attention to detail is remarkable. My new door not only enhances the aesthetics of my home but also provides top-notch security. Fantastic job!",
    name: 'Pradeep Nayak, Balasore, Odisha',
    stars: 3,
  },
  {
    quote:
      "Indoor Axe doors are a perfect combination of style and durability. I bought a set of doors for my industrial unit, and they have proven to be an excellent investment. The doors have stood the test of time and are still as good as new.",
    name: 'Pradeep Nayak, Balasore, Odisha',
    stars: 4,
  },
  {
    quote:
      "I am extremely satisfied with the door I purchased from Indoor Axe. The durability and strength of the door are impressive. Living in a coastal area, it's crucial to have a door that can withstand the elements, and Indoor Axe delivered exactly that.",
    name: 'Alok Mishra, Puri, Odisha',
    stars: 2,
  },
];

function Stars({ count }) {
  return (
    <div className="text-brand-accent" aria-label={`${count} out of 5 stars`}>
      {'★'.repeat(count)}
      <span className="text-gray-300">{'★'.repeat(5 - count)}</span>
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get('/home')
      .then(({ data }) => {
        if (cancelled) return;
        setProducts(Array.isArray(data.products) ? data.products : []);
        setBlogs(Array.isArray(data.blogs) ? data.blogs : []);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load the latest products and blogs right now.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const featuredProducts = products.slice(0, 8);
  const featuredBlogs = blogs.slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[60vh] items-center justify-center bg-brand text-center text-white">
        <div className="mx-auto max-w-3xl px-4 py-24">
          <h1 className="text-3xl font-bold sm:text-5xl">
            Step inside the world of craftsmanship and innovation at IndoorAxe
          </h1>
          <p className="mt-4 text-lg text-gray-300">Where Every Door Welcomes Possibilities.</p>
          <div className="mt-8">
            <Button variant="accent" as={Link} to="/about">
              About Us!
            </Button>
          </div>
        </div>
      </section>

      {/* What we offer */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-brand sm:text-3xl">What we offer to our clients</h2>
        <p className="mt-2 text-gray-500">Who are in extremely love with eco friendly system.</p>

        {loading ? (
          <Spinner label="Loading products…" />
        ) : error ? (
          <p className="mt-10 text-red-600">{error}</p>
        ) : featuredProducts.length === 0 ? (
          <p className="mt-10 text-gray-500">No products available yet — check back soon.</p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((p) => (
              <ProductCard key={p._id || p.slug} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Recent works / showcase gallery */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-brand sm:text-3xl">Our Recent Works may impress you</h2>
            <p className="mt-2 text-gray-500">Who are in extremely love with eco friendly system.</p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SHOWCASES.map((s) => (
              <Link
                key={s.id}
                to={`/showcase/${s.id}`}
                className="group relative block overflow-hidden rounded-lg shadow-sm"
              >
                <img
                  src={s.image}
                  alt={s.title}
                  className="h-64 w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 p-4 text-center opacity-0 transition group-hover:opacity-100">
                  <h3 className="text-lg font-semibold text-white">{s.title}</h3>
                  <span className="text-sm font-semibold uppercase tracking-wide text-brand-accent">
                    More Details →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-brand py-16 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Some Features that Made us Unique</h2>
            <p className="mt-2 text-gray-300">Who are in extremely love with eco friendly system.</p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title}>
                <h4 className="text-lg font-semibold text-brand-accent">{f.title}</h4>
                <p className="mt-2 text-gray-300">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-brand sm:text-3xl">Testimonial from our Clients</h2>
          <p className="mt-2 text-gray-500">Who are in extremely love with eco friendly system.</p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-gray-600">{t.quote}</p>
              <h4 className="mt-4 font-semibold text-brand">{t.name}</h4>
              <Stars count={t.stars} />
            </div>
          ))}
        </div>
      </section>

      {/* Blogs */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-brand sm:text-3xl">News and blogs</h2>
          </div>

          {loading ? (
            <Spinner label="Loading blogs…" />
          ) : featuredBlogs.length === 0 ? (
            <p className="mt-10 text-center text-gray-500">No blog posts published yet.</p>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredBlogs.map((b) => (
                <BlogCard key={b._id || b.slug} blog={b} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
