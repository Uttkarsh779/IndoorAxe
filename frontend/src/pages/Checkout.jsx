import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios.js';
import { Input, Textarea } from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Spinner from '../components/Spinner.jsx';

function money(n) {
  const num = Number(n) || 0;
  return num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

// Ports views.booking + checkout.html.
export default function Checkout() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [form, setForm] = useState({
    email: '',
    call: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    remark: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError('');

    api
      .get(`/orders/${slug}`)
      .then((res) => {
        if (cancelled) return;
        const ord = res.data.order;
        setOrder(ord);
        setForm({
          email: ord.email || '',
          call: ord.call || '',
          address: ord.address || '',
          city: ord.city || '',
          state: ord.state || '',
          pincode: ord.pincode || '',
          remark: ord.remark || '',
        });
      })
      .catch(() => {
        if (!cancelled) setLoadError('We could not find this order. Please check the link and try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  function handleChange(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      const { data } = await api.patch(`/orders/${slug}/billing`, form);
      setOrder(data.order);
      navigate(`/payment/${slug}`);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Could not save billing details. Please try again.');
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner label="Loading order…" />;

  if (loadError || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-brand">Order not found</h1>
        <p className="mt-3 text-gray-500">{loadError || 'This order could not be loaded.'}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl font-bold text-brand sm:text-3xl">Checkout</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-brand">Billing Address</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={handleChange('email')}
                required
              />
              <Input
                label="Phone Number"
                type="text"
                placeholder="Whatsapp number"
                value={form.call}
                onChange={handleChange('call')}
                required
              />
              <Input
                label="Address"
                type="text"
                placeholder="542 W. 15th Street"
                value={form.address}
                onChange={handleChange('address')}
                required
              />
              <Input
                label="City"
                type="text"
                placeholder="New York"
                value={form.city}
                onChange={handleChange('city')}
                required
              />
              <Textarea
                label="Remarks"
                placeholder="Ex. 'Specific Color for door, Specific position for Accessories'"
                value={form.remark}
                onChange={handleChange('remark')}
                required
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="State"
                  type="text"
                  placeholder="Odisha"
                  value={form.state}
                  onChange={handleChange('state')}
                  required
                />
                <Input
                  label="Zip"
                  type="text"
                  placeholder="10001"
                  value={form.pincode}
                  onChange={handleChange('pincode')}
                  required
                />
              </div>

              {submitError && <p className="text-sm text-red-600">{submitError}</p>}

              <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                {submitting ? 'Saving…' : 'Continue to checkout'}
              </Button>
            </form>
          </Card>
        </div>

        <div>
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-brand">Order Summary</h2>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Product Name</dt>
                <dd className="font-medium text-gray-900">{order.product?.name || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Quantity</dt>
                <dd className="font-medium text-gray-900">{order.qty} nos</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Length</dt>
                <dd className="font-medium text-gray-900">{order.length} ft</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Width</dt>
                <dd className="font-medium text-gray-900">{order.breadth} ft</dd>
              </div>
              {order.addon?.name && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Addon</dt>
                  <dd className="font-medium text-gray-900">{order.addon.name}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Total (Including GST)</dt>
                <dd className="font-medium text-gray-900">₹ {money(order.total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">GST</dt>
                <dd className="font-medium text-gray-900">₹ {money(order.gst)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Logistics</dt>
                <dd className="font-medium text-gray-900">₹ {money(order.logistic)}</dd>
              </div>
            </dl>
            <hr className="my-4 border-gray-200" />
            <div className="flex justify-between text-base font-bold text-brand">
              <span>Total</span>
              <span>₹ {money(order.amount)} /Only</span>
            </div>
            <Link
              to={`/orders/${slug}/quote`}
              className="mt-6 inline-block text-sm font-semibold text-brand hover:underline"
            >
              Download Quote
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
