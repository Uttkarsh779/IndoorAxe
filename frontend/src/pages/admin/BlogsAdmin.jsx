import { useCallback, useEffect, useState } from 'react';
import api from '../../api/axios.js';
import Button from '../../components/Button.jsx';
import { Input, Textarea, Select } from '../../components/Input.jsx';
import Modal from '../../components/Modal.jsx';
import Spinner from '../../components/Spinner.jsx';
import DataTable from '../../components/DataTable.jsx';

const STATUS_OPTIONS = ['active', 'inactive'];

function toDateInputValue(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

const emptyForm = {
  title: '',
  statusArticle: 'active',
  createdOn: toDateInputValue(new Date()),
  seoDescription: '',
  seoKeywords: '',
  content: '',
};

function BlogFormModal({ open, onClose, onSaved, editing }) {
  const [form, setForm] = useState(emptyForm);
  const [thumbnail, setThumbnail] = useState(null);
  const [banner, setBanner] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        title: editing.title || '',
        statusArticle: editing.statusArticle || 'active',
        createdOn: toDateInputValue(editing.createdOn) || toDateInputValue(new Date()),
        seoDescription: editing.seoDescription || '',
        seoKeywords: editing.seoKeywords || '',
        content: editing.content || '',
      });
    } else {
      setForm({ ...emptyForm, createdOn: toDateInputValue(new Date()) });
    }
    setThumbnail(null);
    setBanner(null);
    setError('');
  }, [editing, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => fd.append(key, value));
      if (thumbnail) fd.append('thumbnail', thumbnail);
      if (banner) fd.append('banner', banner);

      if (editing) {
        await api.put(`/admin/blogs/${editing._id}`, fd);
      } else {
        await api.post('/admin/blogs', fd);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save blog post.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Blog Post' : 'Add Blog Post'}>
      <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Status"
            value={form.statusArticle}
            onChange={(e) => setForm({ ...form, statusArticle: e.target.value })}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Input
            label="Created On"
            type="date"
            value={form.createdOn}
            onChange={(e) => setForm({ ...form, createdOn: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600">
              Thumbnail {editing && <span className="font-normal text-gray-400">(leave blank to keep)</span>}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">
              Banner {editing && <span className="font-normal text-gray-400">(leave blank to keep)</span>}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBanner(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-xs"
            />
          </div>
        </div>

        <Textarea
          label="SEO Description"
          rows={2}
          value={form.seoDescription}
          onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
        />
        <Textarea
          label="SEO Keywords"
          rows={2}
          value={form.seoKeywords}
          onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })}
        />
        <Textarea
          label="Content (HTML source)"
          rows={6}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
        <p className="text-xs text-gray-400">
          No rich-text editor library is available in this project, so content/SEO fields are plain textareas that accept
          raw HTML source (mirrors the original CKEditor fields' stored output, just without the WYSIWYG toolbar).
        </p>

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

export default function BlogsAdmin() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (status !== 'all') params.status = status;
      const { data } = await api.get('/admin/blogs', { params });
      setBlogs(data.blogs || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load blog posts.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete blog post "${row.title}"?`)) return;
    try {
      await api.delete(`/admin/blogs/${row._id}`);
      fetchBlogs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete blog post.');
    }
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'statusArticle', label: 'Status' },
    {
      key: 'createdOn',
      label: 'Created On',
      render: (row) => (row.createdOn ? new Date(row.createdOn).toLocaleDateString() : '—'),
    },
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
        <h1 className="text-2xl font-bold text-brand">Blogs</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          Add Blog Post
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <div className="max-w-sm flex-1">
          <Input placeholder="Search by title…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="w-40">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
      </div>

      {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4">
        {loading ? <Spinner label="Loading blog posts…" /> : <DataTable columns={columns} rows={blogs} emptyLabel="No blog posts found." />}
      </div>

      <BlogFormModal
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          fetchBlogs();
        }}
      />
    </div>
  );
}
