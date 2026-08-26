import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-brand sm:text-4xl">Oops! Page Not Found</h1>

      <div className="mt-6">
        <Button as={Link} to="/" variant="primary">
          Home
        </Button>
      </div>

      <img
        src="/images/error-404.gif"
        alt="Page not found"
        className="mt-8 max-h-96 w-full max-w-xl object-contain"
      />
    </section>
  );
}
