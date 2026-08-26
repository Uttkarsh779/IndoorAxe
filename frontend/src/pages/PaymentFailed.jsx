import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';

// Ports PayFail.html.
export default function PaymentFailed() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-10 w-10">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 className="mt-6 text-3xl font-bold text-brand">Payment Failed</h1>
      <p className="mt-3 text-gray-600">
        Something went wrong and your payment could not be completed. Nothing has been charged for this attempt —
        please try again.
      </p>
      <div className="mt-8 flex gap-4">
        <Button as={Link} to="/dashboard" variant="accent">
          Try Again
        </Button>
        <Button as={Link} to="/" variant="outline">
          Back to Home
        </Button>
      </div>
    </div>
  );
}
