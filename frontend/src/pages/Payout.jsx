import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { Input, Textarea } from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';

// Ports views.payout + payadd form (payout.html). Public - no auth required,
// matching the original which has no login_required on payadd/paycheck.
export default function Payout() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ userLabel: '', email: '', amount: '', remark: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleChange(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post('/demand-orders', form);
      navigate(`/payout/${data.demandOrder.slug}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start this payment. Please check the details and try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Card className="p-8">
        <h1 className="text-center text-2xl font-bold text-brand">Payment Details!</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Input
            label="Name"
            type="text"
            placeholder="Your name"
            value={form.userLabel}
            onChange={handleChange('userLabel')}
            required
          />
          <Input
            label="Email-ID"
            type="email"
            placeholder="Enter Email-ID"
            value={form.email}
            onChange={handleChange('email')}
            required
          />
          <Input
            label="Amount (INR)"
            type="number"
            min="1"
            placeholder="Enter Amount in (INR)"
            value={form.amount}
            onChange={handleChange('amount')}
            required
          />
          <Textarea
            label="Purpose of payment"
            placeholder="Enter Remark"
            value={form.remark}
            onChange={handleChange('remark')}
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" variant="accent" disabled={submitting} className="w-full">
            {submitting ? 'Processing…' : 'Make Payment'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
