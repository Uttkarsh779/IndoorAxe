import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios.js';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Spinner from '../components/Spinner.jsx';

function money(n) {
  const num = Number(n) || 0;
  return num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

// Ports views.quote (quote.html) - a downloadable quote view.
export default function OrderQuote() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    api
      .get(`/orders/${slug}/quote`)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        if (!cancelled) setError('This quote could not be found.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) return <Spinner label="Loading quote…" />;

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-brand">Quote not found</h1>
        <p className="mt-3 text-gray-500">{error}</p>
      </div>
    );
  }

  const { order, gst, csgst, addonCost, total } = data;
  const issueDate = new Date().toLocaleDateString('en-GB');

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 print:py-0">
      <div className="mb-6 text-right print:hidden">
        {/* The original never generated a real PDF either - it rendered an
            HTML page the user could print. window.print() is faithful parity. */}
        <Button variant="accent" onClick={() => window.print()}>
          Print / Save as PDF
        </Button>
      </div>

      <Card className="p-8 print:border-0 print:shadow-none">
        <div className="flex flex-col justify-between gap-6 sm:flex-row">
          <div>
            <p className="font-semibold text-brand">Indoor Axe Pvt Ltd</p>
            <p className="text-sm text-gray-500">info@indooraxe.in</p>
            <p className="text-sm text-gray-500">+91 97764 42267</p>
            <p className="text-sm text-gray-500">MIG-281, Kalinga Vihar, Patrapada, Bhubaneswar, Pincode: 751019</p>
            <p className="mt-2 text-sm text-gray-500">Issue Date: {issueDate}</p>
          </div>
          <div className="sm:text-right">
            <p className="font-semibold text-brand">Quote For</p>
            <p className="text-sm text-gray-500">{order.email}</p>
            <p className="text-sm text-gray-500">{order.call}</p>
            <p className="text-sm text-gray-500">{order.address}</p>
          </div>
        </div>

        <h1 className="mt-10 text-center text-3xl font-bold text-brand">QUOTE</h1>

        <div className="mt-6 grid grid-cols-2 gap-4 rounded-md bg-gray-50 p-4 text-sm sm:grid-cols-4">
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

        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-brand text-white">
                <th className="px-3 py-2 text-left">S.No</th>
                <th className="px-3 py-2 text-left">Item</th>
                <th className="px-3 py-2 text-right">QTY</th>
                <th className="px-3 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-3 py-2">1</td>
                <td className="px-3 py-2">{order.product?.name || '—'}</td>
                <td className="px-3 py-2 text-right">{order.qty}</td>
                <td className="px-3 py-2 text-right">₹ {money(total)}</td>
              </tr>
              {order.addon?.name && (
                <tr>
                  <td className="px-3 py-2">2</td>
                  <td className="px-3 py-2">{order.addon.name} (Addon)</td>
                  <td className="px-3 py-2 text-right">{order.qty}</td>
                  <td className="px-3 py-2 text-right">₹ {money(addonCost)}</td>
                </tr>
              )}
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
            <p className="font-semibold text-brand">Payment To</p>
            <p>HDFC Bank</p>
            <p>Account Name: Indoor Axe Pvt Ltd</p>
            <p>Account No: 1234567890</p>
            <p>IFSC Code: HDFC000012</p>
          </div>
          <div className="sm:text-right">
            <p className="font-semibold text-brand">Indoor Axe Pvt Ltd</p>
            <p>MIG-281, Kalinga Vihar, Patrapada, Bhubaneswar, Pincode: 751019</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
