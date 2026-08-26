import { Link } from 'react-router-dom';
import logo from '../assets/logos/logo-transparent.png';
import { FacebookIcon, InstagramIcon, LinkedInIcon, YoutubeIcon } from './SocialIcons.jsx';

const SOCIALS = [
  { href: 'https://m.facebook.com/p/Indoor-axe-metal-Pvt-Ltd-100078793398342/', label: 'Facebook', Icon: FacebookIcon },
  { href: 'https://in.linkedin.com/company/indoor-axe-metal-private-limited', label: 'LinkedIn', Icon: LinkedInIcon },
  { href: 'https://www.youtube.com/@indooraxemetal84', label: 'YouTube', Icon: YoutubeIcon },
  { href: 'https://www.instagram.com/indoor_axe_metal/?hl=en', label: 'Instagram', Icon: InstagramIcon },
];

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/about', label: 'About' },
  { to: '/payout', label: 'More Payments' },
  { to: '/terms', label: 'Terms' },
  { to: '/privacy', label: 'Privacy Policy' },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-100 bg-gray-50">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-10 text-center">
        <img src={logo} alt="Indoor Axe Pvt Ltd" className="h-10 w-auto object-contain" />
        <div className="flex gap-4 text-gray-500">
          {SOCIALS.map(({ label, href, Icon }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="hover:text-brand">
              <Icon />
            </a>
          ))}
        </div>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-600">
          {LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-brand">
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-gray-400">Indoor Axe Metals Pvt Ltd © {new Date().getFullYear()}</p>
        <p className="text-xs text-gray-400">
          Designed &amp; Developed by{' '}
          <a
            href="https://moiratech.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-brand hover:underline"
          >
            Moira Tech
          </a>
        </p>
      </div>
    </footer>
  );
}
