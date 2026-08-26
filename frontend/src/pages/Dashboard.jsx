import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/Button.jsx';
import DataTable from '../components/DataTable.jsx';
import Spinner from '../components/Spinner.jsx';

const STATUS_STYLES = {
  'Received Order': 'bg-gray-100 text-gray-700',
  Shipped: 'bg-blue-100 text-blue-700',
  Delivering: 'bg-amber-100 text-amber-700',
  Delivered: 'bg-green-100 text-green-700',
};

export default function Dashboard() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get('/orders/mine');
        if (!cancelled) setOrders(data.orders || []);
      } catch {
        if (!cancelled) setError('Could not load your orders. Please try again later.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOrders();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const columns = [
    { key: 'product', label: 'Product', render: (row) => row.product?.name || '—' },
    { key: 'orderDate', label: 'Order Date', render: (row) => row.orderDate || '—' },
    {
      key: 'orderStatus',
      label: 'Order Status',
      render: (row) => (
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
            STATUS_STYLES[row.orderStatus] || 'bg-gray-100 text-gray-700'
          }`}
        >
          {row.orderStatus}
        </span>
      ),
    },
    {
      key: 'bill',
      label: 'More Info / Bill',
      render: (row) => (
        <Link to={`/orders/${row.slug}/bill`} className="font-semibold text-brand hover:underline">
          Bill
        </Link>
      ),
    },
  ];

  if (loading) {
    return <Spinner label="Loading your orders…" />;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-brand">Welcome {user?.name}!</h1>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {isAdmin && (
        <div className="mb-8 flex items-center justify-between gap-4 rounded-xl border border-brand/20 bg-brand/5 px-5 py-4">
          <div>
            <p className="font-semibold text-brand">You have admin access</p>
            <p className="mt-0.5 text-sm text-gray-500">Manage products, orders, blogs, and more from the admin panel.</p>
          </div>
          <Link
            to="/admin"
            className="shrink-0 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            Go to Admin Panel →
          </Link>
        </div>
      )}

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <DataTable columns={columns} rows={orders} rowKey="_id" emptyLabel="You have no orders yet." />
    </div>
  );
}
