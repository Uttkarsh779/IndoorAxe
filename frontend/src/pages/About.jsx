import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';

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

const TEAM = [
  {
    name: 'Samarpan Das',
    image: '/images/team/samarpan-das.png',
    linkedin: 'https://www.linkedin.com/in/samarpan-das-4462899b/',
    email: 'samarpan@indooraxe.in',
    desc:
      'Mr. Samarpan Das is the CEO of IndoorAxe Pvt Ltd. He is a pioneer in door manufacturing with the vision to transform the Door Manufacturing industry.',
  },
  {
    name: 'Gulfam Sekh',
    image: '/images/team/gulfam-sekh.png',
    linkedin: 'https://www.linkedin.com/in/gulpham-sekh-5b72ab223/',
    email: 'gulpham@indooraxe.in',
    desc:
      'Gulfam Sekh is the master behind the manufacturing process and logistics for ensuring smooth on-time delivery of products to our customer.',
  },
  {
    name: 'Nanda Nandan Sarangi',
    image: '/images/team/nanda-nandan-sarangi.jpeg',
    linkedin: 'https://www.linkedin.com/in/nanda-nandan-sarangi-4a3172158/',
    email: 'nanda@indooraxe.in',
    desc:
      'Nanda Nandan Sarangi, The Project Management Consultant at IndoorAxe, leading innovation in Door manufacturing with strategic expertise.',
  },
  {
    name: 'Binayak Subhasish Sahoo',
    image: '/images/team/binayak-subhasish-sahoo.jpeg',
    linkedin: 'https://www.linkedin.com/in/binayak-subhasish-s-99698353/',
    email: 'binayak@indooraxe.in',
    desc: 'Binayak Subhasish Sahoo, HOD at IndoorAxe Italy, leads innovation in door manufacturing with expertise and dedication.',
  },
  {
    name: 'Sandeep Mishra',
    image: '/images/team/sandeep-mishra.jpg',
    linkedin: 'https://www.linkedin.com/in/sandmishra/',
    email: 'sandeep@indooraxe.in',
    desc: 'Sandeep Mishra, HOD at IndoorAxe UAE, leads innovation in door manufacturing with expertise and dedication.',
  },
  {
    name: 'Dipee Behera',
    image: '/images/team/dipee-behera.jpeg',
    linkedin: 'https://www.linkedin.com/in/dipee-behera-b51218245/',
    email: 'hr@indooraxe.in',
    desc: 'Dipee Behera, HR Manager at IndoorAxe, she steers the human resources function for the door manufacturing company.',
  },
  {
    name: 'Soumya Mohapatra',
    image: '/images/team/soumya-mohapatra.png',
    linkedin: '',
    email: 'service@indooraxe.in',
    desc: 'As a Production and Service Engineer at IndoorAxe, I ensure seamless production and top-notch service for our innovative Doors.',
  },
  {
    name: 'Mahabeer Satapathy',
    image: '/images/team/mahabeer-satapathy.png',
    linkedin: 'https://www.linkedin.com/in/mahabeer-prasad-satapathy-2b93ab272/',
    email: '',
    desc: 'Mahabeer, Sr. Business Development Executive at IndoorAxe, drives Door manufacturing innovation with strategic partnerships and market expansion.',
  },
  {
    name: 'Sangeeta Naik',
    image: '/images/team/sangeeta-naik.jpeg',
    linkedin: 'https://www.linkedin.com/in/sangita-naik-1b38992a3/',
    email: 'sales1@indooraxe.in',
    desc: 'Sangeeta Naik, Business Development Executive at IndoorAxe, drives growth for the door manufacturing company through strategic initiatives and partnerships.',
  },
];

export default function About() {
  return (
    <div>
      {/* Banner */}
      <section className="bg-brand py-16 text-center text-white">
        <h1 className="text-3xl font-bold sm:text-4xl">About Us</h1>
        <p className="mt-3 text-sm text-gray-300">
          <Link to="/" className="hover:text-brand-accent">
            Home
          </Link>{' '}
          <span className="mx-1">→</span> About Us
        </p>
      </section>

      {/* About intro */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <h6 className="text-sm font-semibold uppercase tracking-wide text-brand-accent">IndoorAxe</h6>
            <h2 className="mt-2 text-2xl font-bold text-brand sm:text-3xl">About us!</h2>
            <p className="mt-4 text-gray-600">Indoor Axe is a premier door manufacturing company,</p>
            <p className="mt-2 text-gray-600">
              crafting innovative and stylish interior doors to transform your living spaces. Quality craftsmanship,
              unmatched designs.
            </p>
          </div>
          <div className="relative flex items-center justify-center overflow-hidden rounded-lg bg-gray-100">
            <a
              href="https://www.youtube.com/watch?v=U8RqEaTl9Is"
              target="_blank"
              rel="noreferrer"
              className="flex h-64 w-full items-center justify-center"
            >
              <img src="/images/play-btn.png" alt="Play video" className="h-16 w-16 object-contain" />
            </a>
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

      {/* Call to action */}
      <section className="bg-gray-50 py-16 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold text-brand sm:text-3xl">
            Looking for a quality and affordable interior design?
          </h2>
          <p className="mt-4 text-gray-600">
            Our Team at IndoorAxe have amazing interior designers too, who can build your dream office/home in your
            budget.
          </p>
          <div className="mt-6">
            <Button variant="accent" as={Link} to="/contact">
              Request quote now
            </Button>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-brand sm:text-3xl">Our Team</h2>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((member) => (
            <div key={member.name} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="aspect-square w-full overflow-hidden rounded bg-gray-100">
                <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
              </div>
              <h4 className="mt-4 text-lg font-semibold text-brand">{member.name}</h4>
              <div className="mt-1 flex gap-3 text-sm text-gray-500">
                {member.linkedin && (
                  <a href={member.linkedin} target="_blank" rel="noreferrer" className="hover:text-brand-accent">
                    LinkedIn
                  </a>
                )}
                {member.email && (
                  <a href={`mailto:${member.email}`} className="hover:text-brand-accent">
                    Email
                  </a>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-600">{member.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
