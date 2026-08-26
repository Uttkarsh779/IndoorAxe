import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios.js';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Spinner from '../components/Spinner.jsx';
import { useRazorpayCheckout } from '../hooks/useRazorpayCheckout.js';

function money(n) {
  const num = Number(n) || 0;
  return num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

// Ports views.paycheck (paycheck.html). Public - no auth required.
export default function PayoutCheck() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { openCheckout } = useRazorpayCheckout();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError('');

    api
      .get(`/demand-orders/${slug}/payment`)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err.response?.data?.message || 'Could not set up this payment. Please try again shortly.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function handlePay() {
    if (!data) return;
    setPaying(true);
    try {
      const { razorpayOrder, demandOrder, razorpayKeyId } = data;
      const result = await openCheckout({
        keyId: razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        orderId: razorpayOrder.id,
        name: 'Indoor Axe Pvt Ltd',
        description: 'Custom payment',
        prefill: { email: demandOrder.email, contact: demandOrder.call },
      });
      await api.post('/payments/demand-orders/callback', result);
      // Matches the original, which redirects home after a successful ad-hoc
      // payment rather than to a dashboard, since this flow isn't tied to a login.
      navigate('/');
    } catch {
      navigate('/payment-failed');
    }
  }

  if (loading) return <Spinner label="Preparing payment…" />;

  if (loadError || !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-brand">Payment unavailable</h1>
        <p className="mt-3 text-gray-500">{loadError || 'Something went wrong preparing this payment.'}</p>
      </div>
    );
  }

  const { demandOrder } = data;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card className="overflow-hidden">
        <div className="bg-gray-100 py-6 text-center text-xl font-semibold text-gray-600">Pay Invoice</div>
        <div className="p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">Payment amount</p>
          <p className="mt-2 text-3xl font-bold text-brand">₹ {money(demandOrder.amount)}</p>

          <Button variant="accent" className="mt-8 w-full justify-center" onClick={handlePay} disabled={paying}>
            {paying ? 'Processing…' : `Pay ₹ ${money(demandOrder.amount)}`}
          </Button>
        </div>
      </Card>
    </div>
  );
}
