import { Link } from 'react-router-dom';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';

const SECTIONS = [
  { to: '/admin/products', label: 'Products', desc: 'Manage the product catalog: pricing, type, SEO fields, and photos.' },
  { to: '/admin/blogs', label: 'Blogs', desc: 'Publish and edit blog articles, thumbnails, and banners.' },
  { to: '/admin/orders', label: 'Orders', desc: 'Review customer orders and update fulfillment status.' },
  { to: '/admin/demand-orders', label: 'Demand Orders', desc: 'View ad-hoc "pay anything" payment requests (read-only).' },
  { to: '/admin/contacts', label: 'Contacts', desc: 'Contact form and landing page lead submissions.' },
  { to: '/admin/delivery-charges', label: 'Delivery Charges', desc: 'Per-state delivery pricing used at checkout.' },
  { to: '/admin/testimonials', label: 'Testimonials', desc: 'Customer testimonials (name, comment, photo).' },
  { to: '/admin/client-logos', label: 'Client Logos', desc: 'Logos shown in the clients showcase.' },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand">Admin Console</h1>
      <p className="mt-1 text-sm text-gray-500">Manage Indoor Axe&rsquo;s site content, orders, and leads.</p>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <Card key={s.to} className="flex flex-col justify-between p-5">
            <div>
              <h2 className="text-lg font-semibold text-brand">{s.label}</h2>
              <p className="mt-1 text-sm text-gray-500">{s.desc}</p>
            </div>
            <Button as={Link} to={s.to} variant="outline" className="mt-4 self-start">
              Open
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
