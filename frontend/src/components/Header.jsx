import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import logo from '../assets/logos/logo-transparent.png';
import { FacebookIcon, InstagramIcon, LinkedInIcon, YoutubeIcon } from './SocialIcons.jsx';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/products', label: 'Products' },
  { to: '/blogs', label: 'Blogs' },
  { to: '/contact', label: 'Contact' },
];

const SOCIALS = [
  { href: 'https://m.facebook.com/p/Indoor-axe-metal-Pvt-Ltd-100078793398342/', label: 'Facebook', Icon: FacebookIcon },
  { href: 'https://in.linkedin.com/company/indoor-axe-metal-private-limited', label: 'LinkedIn', Icon: LinkedInIcon },
  { href: 'https://www.youtube.com/@indooraxemetal84', label: 'YouTube', Icon: YoutubeIcon },
  { href: 'https://www.instagram.com/indoor_axe_metal/?hl=en', label: 'Instagram', Icon: InstagramIcon },
];

export default function Header() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="hidden items-center justify-between bg-brand px-4 py-2 text-xs text-gray-200 sm:flex">
        <div className="flex gap-4">
          <a href="tel:+918895493966" className="hover:text-white">
            +91 88954 93966
          </a>
          <a href="mailto:info@indooraxe.in" className="hover:text-white">
            info@indooraxe.in
          </a>
        </div>
        <div className="flex gap-3">
          {SOCIALS.map(({ label, href, Icon }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="hover:text-white">
              <Icon />
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Indoor Axe Pvt Ltd" className="h-12 w-auto object-contain" />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-brand' : 'text-gray-600 hover:text-brand'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated && isAdmin && (
            <Link
              to="/admin"
              className="rounded-md bg-brand-accent px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
            >
              Admin Panel
            </Link>
          )}
          <Link
            to={isAuthenticated ? '/dashboard' : '/login'}
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            {isAuthenticated ? 'Dashboard' : 'Login!'}
          </Link>
        </nav>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-gray-100 px-4 py-3 md:hidden">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-gray-100 text-brand' : 'text-gray-600'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated && isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className="mt-1 rounded-md bg-brand-accent px-3 py-2 text-center text-sm font-semibold text-black"
            >
              Admin Panel
            </Link>
          )}
          <Link
            to={isAuthenticated ? '/dashboard' : '/login'}
            onClick={() => setMenuOpen(false)}
            className="mt-1 rounded-md bg-brand px-3 py-2 text-center text-sm font-semibold text-white"
          >
            {isAuthenticated ? 'Dashboard' : 'Login!'}
          </Link>
        </nav>
      )}
    </header>
  );
}
