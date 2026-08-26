import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';

// Ports PaySuccess.html.
export default function PaymentSuccess() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-10 w-10">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="mt-6 text-3xl font-bold text-brand">Congratulations!</h1>
      <p className="mt-3 text-gray-600">
        Your payment was successful. Thank you for choosing Indoor Axe — we&apos;ll be in touch shortly to move your
        order forward.
      </p>
      <Button as={Link} to="/dashboard" variant="accent" className="mt-8">
        To Dashboard
      </Button>
    </div>
  );
}
