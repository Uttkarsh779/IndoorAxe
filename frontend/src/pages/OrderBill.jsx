import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios.js';
import Card from '../components/Card.jsx';
import Spinner from '../components/Spinner.jsx';

function money(n) {
  const num = Number(n) || 0;
  return num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

// Ports views.show (show.html) - a paid invoice/bill view.
export default function OrderBill() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    api
      .get(`/orders/${slug}/bill`)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        if (!cancelled) setError('This bill could not be found.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) return <Spinner label="Loading bill…" />;

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-brand">Bill not found</h1>
        <p className="mt-3 text-gray-500">{error}</p>
      </div>
    );
  }

  const { order, gst, csgst } = data;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Card className="p-8">
        <h1 className="text-center text-3xl font-bold text-brand">INVOICE</h1>
        <div className="mt-2 text-center text-sm text-gray-500">Order #{order.slug}</div>

        <div className="mt-8 grid grid-cols-2 gap-4 rounded-md bg-gray-50 p-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-gray-400">Product</p>
            <p className="font-medium text-gray-900">{order.product?.name || '—'}</p>
          </div>
          <div>
            <p className="text-gray-400">Quantity</p>
            <p className="font-medium text-gray-900">{order.qty} nos</p>
          </div>
          <div>
            <p className="text-gray-400">Length</p>
            <p className="font-medium text-gray-900">{order.length} ft</p>
          </div>
          <div>
            <p className="text-gray-400">Width</p>
            <p className="font-medium text-gray-900">{order.breadth} ft</p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-brand text-white">
                <th className="px-3 py-2 text-left">S.No</th>
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-right">QTY</th>
                <th className="px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-3 py-2">1</td>
                <td className="px-3 py-2">{order.product?.name || '—'}</td>
                <td className="px-3 py-2 text-right">{order.qty}</td>
                <td className="px-3 py-2 text-right">₹ {money(order.total)}</td>
              </tr>
              <tr>
                <td colSpan={2} />
                <td className="px-3 py-2 text-right font-semibold">CGST (9%)</td>
                <td className="px-3 py-2 text-right">₹ {money(csgst)}</td>
              </tr>
              <tr>
                <td colSpan={2} />
                <td className="px-3 py-2 text-right font-semibold">SGST (9%)</td>
                <td className="px-3 py-2 text-right">₹ {money(csgst)}</td>
              </tr>
              <tr>
                <td colSpan={2} />
                <td className="px-3 py-2 text-right font-semibold">Total GST (18%)</td>
                <td className="px-3 py-2 text-right">₹ {money(gst)}</td>
              </tr>
              <tr>
                <td colSpan={2} />
                <td className="px-3 py-2 text-right font-semibold">Delivery</td>
                <td className="px-3 py-2 text-right">₹ {money(order.logistic)}</td>
              </tr>
              <tr className="border-t-2 border-brand">
                <td colSpan={2} />
                <td className="px-3 py-2 text-right text-base font-bold text-brand">Total</td>
                <td className="px-3 py-2 text-right text-base font-bold text-brand">₹ {money(order.amount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 text-sm text-gray-600 sm:grid-cols-2">
          <div>
            <p className="font-semibold text-brand">Billed To</p>
            <p>{order.email}</p>
            <p>{order.call}</p>
            <p>{order.address}</p>
            <p>
              {order.city} {order.state} {order.pincode}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="font-semibold text-brand">Indoor Axe Pvt Ltd</p>
            <p>MIG-281, Kalinga Vihar, Patrapada, Bhubaneswar</p>
            <p>Pincode: 751019</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
