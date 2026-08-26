import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/blogs', label: 'Blogs' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/demand-orders', label: 'Demand Orders' },
  { to: '/admin/contacts', label: 'Contacts' },
  { to: '/admin/delivery-charges', label: 'Delivery Charges' },
  { to: '/admin/testimonials', label: 'Testimonials' },
  { to: '/admin/client-logos', label: 'Client Logos' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-[80vh] flex-col bg-gray-100 md:flex-row">
      <aside className="flex shrink-0 flex-col bg-brand text-gray-200 md:w-64">
        <div className="border-b border-white/10 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">Indoor Axe</p>
          <p className="text-lg font-semibold text-white">Admin Console</p>
        </div>
        <nav className="flex flex-1 flex-wrap gap-1 px-3 py-4 md:flex-col md:flex-nowrap">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-accent text-black' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 px-5 py-4 text-xs text-gray-400">
          <p className="truncate text-gray-300">{user?.email}</p>
          <button onClick={logout} className="mt-2 font-semibold text-brand-accent hover:underline">
            Log out
          </button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
