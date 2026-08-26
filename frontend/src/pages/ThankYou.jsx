import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';

export default function ThankYou() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg sm:p-10">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <span className="text-4xl text-green-600">✓</span>
        </div>

        <h1 className="text-2xl font-bold text-brand">Thank You for Connecting with Indooraxe!</h1>

        <p className="mt-4 text-gray-600">
          Your enquiry has been successfully received. Our team will contact you within <strong>24 hours</strong> to
          discuss your requirements and help you choose the perfect door solution.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Button as={Link} to="/products" variant="primary" className="w-full">
            Explore More Products
          </Button>
          <Button as={Link} to="/" variant="ghost">
            ← Back to Home
          </Button>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Premium Doors &bull; Expert Installation &bull; Designed in Bhubaneswar
        </p>
      </div>
    </section>
  );
}
