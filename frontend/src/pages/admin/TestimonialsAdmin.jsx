import { useCallback, useEffect, useState } from 'react';
import api from '../../api/axios.js';
import Button from '../../components/Button.jsx';
import { Input, Textarea } from '../../components/Input.jsx';
import Modal from '../../components/Modal.jsx';
import Spinner from '../../components/Spinner.jsx';
import DataTable from '../../components/DataTable.jsx';

const emptyForm = { name: '', comment: '' };

function truncate(text, max = 60) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function TestimonialFormModal({ open, onClose, onSaved, editing }) {
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm(editing ? { name: editing.name || '', comment: editing.comment || '' } : emptyForm);
    setImage(null);
    setError('');
  }, [editing, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('comment', form.comment);
      if (image) fd.append('image', image);

      if (editing) {
        await api.put(`/admin/testimonials/${editing._id}`, fd);
      } else {
        await api.post('/admin/testimonials', fd);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save testimonial.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Testimonial' : 'Add Testimonial'}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Textarea
          label="Comment"
          rows={4}
          value={form.comment}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
        />
        <div>
          <label className="block text-xs font-medium text-gray-600">
            Image {editing && <span className="font-normal text-gray-400">(leave blank to keep existing)</span>}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="mt-1 block w-full text-xs"
          />
        </div>
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

export default function TestimonialsAdmin() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/testimonials');
      setTestimonials(data.testimonials || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load testimonials.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete testimonial from "${row.name || 'this person'}"?`)) return;
    try {
      await api.delete(`/admin/testimonials/${row._id}`);
      fetchTestimonials();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete testimonial.');
    }
  };

  const columns = [
    {
      key: 'image',
      label: 'Photo',
      render: (row) =>
        row.image ? (
          <img src={row.image} alt={row.name || 'Testimonial'} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <span className="text-gray-300">—</span>
        ),
    },
    { key: 'name', label: 'Name' },
    { key: 'comment', label: 'Comment', render: (row) => truncate(row.comment) },
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
        <h1 className="text-2xl font-bold text-brand">Testimonials</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          Add Testimonial
        </Button>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Not currently rendered on the public site (confirmed in MIGRATION_PLAN.md — the product page&rsquo;s testimonials
        are hardcoded HTML, not DB-driven), but full CRUD is preserved here for admin parity with the original Django
        registration.
      </p>

      {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4">
        {loading ? (
          <Spinner label="Loading testimonials…" />
        ) : (
          <DataTable columns={columns} rows={testimonials} emptyLabel="No testimonials found." />
        )}
      </div>

      <TestimonialFormModal
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          fetchTestimonials();
        }}
      />
    </div>
  );
}
