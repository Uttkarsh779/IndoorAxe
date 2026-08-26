import { useCallback, useEffect, useState } from 'react';
import api from '../../api/axios.js';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import Modal from '../../components/Modal.jsx';
import Spinner from '../../components/Spinner.jsx';

function ClientLogoFormModal({ open, onClose, onSaved, editing }) {
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setImage(null);
    setError('');
  }, [editing, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editing && !image) {
      setError('Please choose an image.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      if (image) fd.append('image', image);

      if (editing) {
        await api.put(`/admin/client-logos/${editing._id}`, fd);
      } else {
        await api.post('/admin/client-logos', fd);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save client logo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Replace Logo' : 'Add Logo'}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        {editing?.image && (
          <img src={editing.image} alt="Current logo" className="h-16 w-auto rounded border border-gray-200 object-contain" />
        )}
        <div>
          <label className="block text-xs font-medium text-gray-600">Logo Image</label>
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

export default function ClientLogosAdmin() {
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchLogos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/client-logos');
      setLogos(data.clientLogos || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load client logos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogos();
  }, [fetchLogos]);

  const handleDelete = async (row) => {
    if (!window.confirm('Delete this client logo?')) return;
    try {
      await api.delete(`/admin/client-logos/${row._id}`);
      fetchLogos();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete client logo.');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand">Client Logos</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          Add Logo
        </Button>
      </div>

      {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4">
        {loading ? (
          <Spinner label="Loading client logos…" />
        ) : logos.length === 0 ? (
          <p className="rounded-lg border border-gray-200 bg-white px-4 py-6 text-center text-gray-400">
            No client logos found.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {logos.map((logo) => (
              <Card key={logo._id} className="flex flex-col items-center gap-3 p-4">
                <div className="flex h-20 w-full items-center justify-center overflow-hidden rounded bg-gray-50">
                  {logo.image ? (
                    <img src={logo.image} alt="Client logo" className="max-h-20 w-full object-contain" />
                  ) : (
                    <span className="text-xs text-gray-300">No image</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="px-3 py-1 text-xs"
                    onClick={() => {
                      setEditing(logo);
                      setModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button variant="ghost" className="px-3 py-1 text-xs text-red-600" onClick={() => handleDelete(logo)}>
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ClientLogoFormModal
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          fetchLogos();
        }}
      />
    </div>
  );
}
