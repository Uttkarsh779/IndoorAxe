import { useCallback, useEffect, useState } from 'react';
import api from '../../api/axios.js';
import { Input, Select } from '../../components/Input.jsx';
import Spinner from '../../components/Spinner.jsx';
import DataTable from '../../components/DataTable.jsx';

// Copied verbatim from backend/src/models/Order.js (ORDER_STATUSES) - the
// frontend and backend are separate builds so this can't be a literal ES
// import, but the values are the exact ground truth from that file.
const ORDER_STATUSES = ['Received Order', 'Shipped', 'Delivering', 'Delivered'];

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/orders', {
        params: debouncedSearch ? { search: debouncedSearch } : {},
      });
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (row, orderStatus) => {
    const previous = row.orderStatus;
    setOrders((prev) => prev.map((o) => (o._id === row._id ? { ...o, orderStatus } : o)));
    setUpdatingId(row._id);
    setError('');
    try {
      await api.patch(`/admin/orders/${row._id}/status`, { orderStatus });
    } catch (err) {
      setOrders((prev) => prev.map((o) => (o._id === row._id ? { ...o, orderStatus: previous } : o)));
      setError(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = [
    { key: 'razorpayOrderId', label: 'Razorpay Order Id', render: (row) => row.razorpay?.orderId || '—' },
    { key: 'product', label: 'Product', render: (row) => row.product?.name || '—' },
    { key: 'user', label: 'User Email', render: (row) => row.user?.email || '—' },
    { key: 'length', label: 'Length' },
    { key: 'breadth', label: 'Breadth' },
    { key: 'qty', label: 'Qty' },
    { key: 'amount', label: 'Amount' },
    { key: 'remark', label: 'Remark' },
    { key: 'paid', label: 'Paid', render: (row) => (row.razorpay?.isPaid ? 'Yes' : 'No') },
    { key: 'email', label: 'Email' },
    { key: 'call', label: 'Call' },
    { key: 'orderDate', label: 'Order Date' },
    { key: 'address', label: 'Address' },
    {
      key: 'orderStatus',
      label: 'Order Status',
      render: (row) => (
        <Select
          value={row.orderStatus}
          disabled={updatingId === row._id}
          onChange={(e) => handleStatusChange(row, e.target.value)}
          className="min-w-[9rem]"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand">Orders</h1>

      <div className="mt-4 max-w-sm">
        <Input placeholder="Search by email or Razorpay order id…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4">
        {loading ? <Spinner label="Loading orders…" /> : <DataTable columns={columns} rows={orders} emptyLabel="No orders found." />}
      </div>
    </div>
  );
}
