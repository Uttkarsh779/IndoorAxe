import { useCallback, useEffect, useState } from 'react';
import api from '../../api/axios.js';
import { Input } from '../../components/Input.jsx';
import Spinner from '../../components/Spinner.jsx';
import DataTable from '../../components/DataTable.jsx';

// Read-only list: no admin create/update/delete route exists for demand
// orders on the backend (backend/src/routes/admin/demandOrder.routes.js
// only wires up GET '/'), so no edit/delete UI is built here.
export default function DemandOrdersAdmin() {
  const [demandOrders, setDemandOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchDemandOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/demand-orders', {
        params: debouncedSearch ? { search: debouncedSearch } : {},
      });
      setDemandOrders(data.demandOrders || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load demand orders.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchDemandOrders();
  }, [fetchDemandOrders]);

  const columns = [
    { key: 'razorpayOrderId', label: 'Razorpay Order Id', render: (row) => row.razorpay?.orderId || '—' },
    { key: 'userLabel', label: 'User' },
    { key: 'amount', label: 'Amount' },
    { key: 'remark', label: 'Remark' },
    { key: 'paid', label: 'Paid', render: (row) => (row.razorpay?.isPaid ? 'Yes' : 'No') },
    { key: 'email', label: 'Email' },
    { key: 'call', label: 'Call' },
    { key: 'orderDate', label: 'Order Date' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand">Demand Orders</h1>
      <p className="mt-1 text-sm text-gray-500">
        Read-only: the backend exposes no admin write endpoints for this resource.
      </p>

      <div className="mt-4 max-w-sm">
        <Input
          placeholder="Search by user, email, or Razorpay order id…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4">
        {loading ? (
          <Spinner label="Loading demand orders…" />
        ) : (
          <DataTable columns={columns} rows={demandOrders} emptyLabel="No demand orders found." />
        )}
      </div>
    </div>
  );
}
