import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { Input } from '../components/Input.jsx';
import Button from '../components/Button.jsx';

const initialForm = { name: '', email: '', call: '' };

const TRUST_ITEMS = [
  { title: 'Made in Bhubaneswar', desc: 'Local Factory Support' },
  { title: '5-Year Warranty', desc: 'Guaranteed Durability' },
  { title: 'Expert Installation', desc: 'Hassle-free Fitting' },
  { title: 'Factory Direct Price', desc: 'No Middlemen Costs' },
];

const PRODUCTS = [
  { title: 'Grand Main Doors', desc: 'Teak & Engineered Wood', image: '/images/landing/5.webp' },
  { title: 'Modern Interior', desc: 'Flush & Laminate Options', image: '/images/landing/2.webp' },
  { title: 'Designer Series', desc: '3D Carving & Custom Art', image: '/images/landing/4.webp' },
  { title: 'WPC & Waterproof', desc: 'For Bathrooms & Balconies', image: '/images/landing/7.webp' },
];

const PROCESS_STEPS = [
  { title: '1. Consultation', desc: 'We visit your site in Bhubaneswar for measurements.' },
  { title: '2. Design Selection', desc: 'Choose from our catalog or customize your own.' },
  { title: '3. Manufacturing', desc: 'Precision crafting at our local factory.' },
  { title: '4. Installation', desc: 'Professional fitting by our expert carpenters.' },
];

const TESTIMONIALS = [
  {
    quote:
      "I ordered 12 doors for my duplex in Patia. The finish is premium and installation was done in 2 days. Highly recommended!",
    name: 'Rahul Mohanty',
    role: 'Homeowner, Bhubaneswar',
  },
  {
    quote:
      "As an architect, finishing is everything. Indoor Axe provides factory finish quality that local carpenters can't match.",
    name: 'Ar. Sneha Das',
    role: 'Interior Designer',
  },
];

const GALLERY = Array.from({ length: 8 }, (_, i) => `/images/landing/${i + 1}.webp`);

export default function Landing() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/leads', form);
      navigate('/thank-you');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong submitting your request. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand py-16 text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="text-sm font-bold uppercase tracking-widest text-brand-accent">
              Premium Door Manufacturers
            </span>
            <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
              Make a Grand Entrance.
              <br /> Secure Your Home.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-gray-300">
              We craft Bhubaneshwar's finest Main Doors, Interior Doors, and Custom Designs. Engineered for safety,
              designed for elegance.
            </p>
            <div className="mt-8 hidden gap-4 lg:flex">
              <Button variant="accent" as="a" href="#products">
                View Designs
              </Button>
              <Button variant="outline" as="a" href="tel:+918895493966" className="border-white text-white hover:bg-white/10">
                Call Expert
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5" id="consultation">
            <div className="rounded-md border-t-4 border-brand-accent bg-white p-6 text-gray-900 shadow-xl">
              <h3 className="text-center text-xl font-bold">Get a Free Consultation</h3>
              <p className="mt-1 text-center text-sm text-gray-500">Fill form to get catalog & price list</p>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <Input label="Name" name="name" placeholder="Enter your name" value={form.name} onChange={handleChange} required />
                <Input
                  label="Email-ID"
                  type="email"
                  name="email"
                  placeholder="Enter Email-ID"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  name="call"
                  placeholder="10-digit mobile number"
                  value={form.call}
                  onChange={handleChange}
                  required
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" variant="accent" disabled={submitting} className="w-full">
                  {submitting ? 'Submitting…' : 'Request Quote'}
                </Button>
                <p className="text-center text-xs text-gray-400">Your details are safe with us.</p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b bg-gray-50 py-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 text-center sm:grid-cols-4">
          {TRUST_ITEMS.map((t) => (
            <div key={t.title}>
              <h6 className="font-bold uppercase text-brand">{t.title}</h6>
              <p className="text-sm text-gray-500">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 lg:grid-cols-2">
          <img src="/images/landing/why.webp" alt="Wood craftsmanship" className="w-full rounded-lg object-cover shadow" />
          <div>
            <h5 className="font-bold uppercase text-brand-accent">Why Choose Indoor Axe?</h5>
            <h2 className="mt-2 text-2xl font-bold text-brand sm:text-3xl">Safety Meets Elegance.</h2>
            <p className="mt-3 text-lg text-gray-600">
              We don't just build doors; we build the first impression of your home.
            </p>
            <p className="mt-3 text-gray-500">
              Based in Bhubaneswar, INDOOR AXE combines traditional craftsmanship with modern engineering. Whether
              you need a Teak Wood masterpiece or a high-security steel door, our factory ensures precision,
              longevity, and style that stands the test of time.
            </p>
            <ul className="mt-4 space-y-2 text-gray-700">
              <li>100% Termite & Water Resistant Options</li>
              <li>Custom Designs for Architects</li>
              <li>Delivered across Odisha</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Product showcase */}
      <section id="products" className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h5 className="font-bold uppercase text-brand-accent">Our Collection</h5>
            <h2 className="mt-2 text-2xl font-bold text-brand sm:text-3xl">Premium Doors for Every Space</h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCTS.map((p) => (
              <a
                key={p.title}
                href="#consultation"
                className="block overflow-hidden rounded-lg bg-white text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <img src={p.image} alt={p.title} className="h-52 w-full object-cover" />
                <div className="p-4">
                  <h5 className="font-bold text-brand">{p.title}</h5>
                  <p className="mt-1 text-sm text-gray-500">{p.desc}</p>
                  <span className="mt-3 inline-block text-sm font-semibold text-brand-accent">Check Price</span>
                </div>
              </a>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button variant="accent" as="a" href="/Bourcher_Indoor.pdf" target="_blank" rel="noreferrer">
              Download Full Catalog
            </Button>
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h5 className="font-bold uppercase text-brand-accent">How We Work</h5>
            <h2 className="mt-2 text-2xl font-bold text-brand sm:text-3xl">From Design to Installation</h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((s) => (
              <div key={s.title}>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-brand-accent bg-brand text-brand-accent">
                  <span className="text-xl font-bold">{s.title.charAt(0)}</span>
                </div>
                <h5 className="mt-4 font-bold text-brand">{s.title}</h5>
                <p className="mt-1 text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-brand py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">What Builders & Homeowners Say</h2>
          <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2">
            {TESTIMONIALS.map((t) => (
              <div key={t.name}>
                <p className="italic text-gray-200">"{t.quote}"</p>
                <h5 className="mt-4 font-semibold text-brand-accent">{t.name}</h5>
                <p className="text-sm text-gray-400">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-brand sm:text-3xl">Our Work Gallery</h2>
            <p className="mt-2 text-gray-500">Explore some of our premium door installations and designs.</p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {GALLERY.map((src) => (
              <div key={src} className="aspect-square overflow-hidden rounded-lg">
                <img src={src} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-brand-accent py-16 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold text-brand sm:text-3xl">Ready to Upgrade Your Home?</h2>
          <p className="mt-3 font-semibold text-brand">Get a free site visit and estimate within 24 hours.</p>
          <div className="mt-6">
            <Button variant="primary" as="a" href="tel:+918895493966">
              Call Now: +91 88954 93966
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
