import { useCallback, useEffect, useState } from 'react';
import api from '../../api/axios.js';
import Button from '../../components/Button.jsx';
import { Input } from '../../components/Input.jsx';
import Spinner from '../../components/Spinner.jsx';
import DataTable from '../../components/DataTable.jsx';

export default function ContactsAdmin() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/contacts', {
        params: debouncedSearch ? { search: debouncedSearch } : {},
      });
      setContacts(data.contacts || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load contacts.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete the submission from "${row.name || 'this contact'}"?`)) return;
    try {
      await api.delete(`/admin/contacts/${row._id}`);
      fetchContacts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete contact.');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'call', label: 'Call' },
    { key: 'question', label: 'Question' },
    { key: 'source', label: 'Source' },
    {
      key: 'createdAt',
      label: 'Created',
      render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <Button variant="ghost" className="px-3 py-1 text-xs text-red-600" onClick={() => handleDelete(row)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand">Contacts</h1>

      <div className="mt-4 max-w-sm">
        <Input
          placeholder="Search by name, email, call, or question…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4">
        {loading ? (
          <Spinner label="Loading contacts…" />
        ) : (
          <DataTable columns={columns} rows={contacts} emptyLabel="No contact submissions found." />
        )}
      </div>
    </div>
  );
}
