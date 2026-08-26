import { useCallback, useEffect, useState } from 'react';
import api from '../../api/axios.js';
import Button from '../../components/Button.jsx';
import { Input } from '../../components/Input.jsx';
import Modal from '../../components/Modal.jsx';
import Spinner from '../../components/Spinner.jsx';
import DataTable from '../../components/DataTable.jsx';

const emptyForm = { state: '', price: '' };

function DeliveryChargeFormModal({ open, onClose, onSaved, editing }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm(editing ? { state: editing.state || '', price: editing.price ?? '' } : emptyForm);
    setError('');
  }, [editing, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const body = { state: form.state, price: Number(form.price) || 0 };
      if (editing) {
        await api.put(`/admin/delivery-charges/${editing._id}`, body);
      } else {
        await api.post('/admin/delivery-charges', body);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save delivery charge.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Delivery Charge' : 'Add Delivery Charge'}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <Input label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
        <Input
          label="Price"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function DeliveryChargesAdmin() {
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchCharges = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/delivery-charges');
      setCharges(data.deliveryCharges || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load delivery charges.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCharges();
  }, [fetchCharges]);

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete delivery charge for "${row.state}"?`)) return;
    try {
      await api.delete(`/admin/delivery-charges/${row._id}`);
      fetchCharges();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete delivery charge.');
    }
  };

  const columns = [
    { key: 'state', label: 'State' },
    { key: 'price', label: 'Price' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="px-3 py-1 text-xs"
            onClick={() => {
              setEditing(row);
              setModalOpen(true);
            }}
          >
            Edit
          </Button>
          <Button variant="ghost" className="px-3 py-1 text-xs text-red-600" onClick={() => handleDelete(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand">Delivery Charges</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          Add Delivery Charge
        </Button>
      </div>

      {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4">
        {loading ? (
          <Spinner label="Loading delivery charges…" />
        ) : (
          <DataTable columns={columns} rows={charges} emptyLabel="No delivery charges found." />
        )}
      </div>

      <DeliveryChargeFormModal
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          fetchCharges();
        }}
      />
    </div>
  );
}
