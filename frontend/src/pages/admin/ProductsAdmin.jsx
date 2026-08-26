import { useCallback, useEffect, useState } from 'react';
import api from '../../api/axios.js';
import Button from '../../components/Button.jsx';
import { Input, Textarea, Select } from '../../components/Input.jsx';
import Modal from '../../components/Modal.jsx';
import Spinner from '../../components/Spinner.jsx';
import DataTable from '../../components/DataTable.jsx';

// Copied verbatim from backend/src/models/Product.js (PRODUCT_TYPES) -
// the frontend and backend are separate builds so this can't be a literal
// ES import, but the values are the exact ground truth from that file.
const PRODUCT_TYPES = ['Commercial', 'Residential', 'Window', 'Fire Hose & Cabinets', 'Accessories', 'Others'];

const IMAGE_FIELDS = [
  { name: 'Image', label: 'Main Image' },
  { name: 'pic1', label: 'Photo 1' },
  { name: 'pic2', label: 'Photo 2' },
  { name: 'pic3', label: 'Photo 3' },
  { name: 'pic4', label: 'Photo 4' },
  { name: 'pic5', label: 'Photo 5' },
  { name: 'pic6', label: 'Photo 6' },
  { name: 'pic7', label: 'Photo 7' },
  { name: 'pic8', label: 'Photo 8' },
  { name: 'pic9', label: 'Photo 9' },
  { name: 'pic10', label: 'Photo 10' },
];

const emptyForm = {
  name: '',
  productType: PRODUCT_TYPES[0],
  startPrice: '',
  startPriceWritten: '',
  pricePerSqft: '',
  seoDescription: '',
  seoKeywords: '',
};

function ProductFormModal({ open, onClose, onSaved, editing }) {
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        name: editing.name || '',
        productType: editing.productType || PRODUCT_TYPES[0],
        startPrice: editing.startPrice || '',
        startPriceWritten: editing.startPriceWritten || '',
        pricePerSqft: editing.pricePerSqft ?? '',
        seoDescription: editing.seoDescription || '',
        seoKeywords: editing.seoKeywords || '',
      });
    } else {
      setForm(emptyForm);
    }
    setFiles({});
    setError('');
  }, [editing, open]);

  const handleFile = (field) => (e) => {
    setFiles((prev) => ({ ...prev, [field]: e.target.files?.[0] || null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => fd.append(key, value));
      IMAGE_FIELDS.forEach(({ name }) => {
        if (files[name]) fd.append(name, files[name]);
      });

      if (editing) {
        await api.put(`/admin/products/${editing._id}`, fd);
      } else {
        await api.post('/admin/products', fd);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Product' : 'Add Product'}>
      <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />

        <Select
          label="Product Type"
          value={form.productType}
          onChange={(e) => setForm({ ...form, productType: e.target.value })}
        >
          {PRODUCT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start Price"
            value={form.startPrice}
            onChange={(e) => setForm({ ...form, startPrice: e.target.value })}
          />
          <Input
            label="Start Price Written"
            value={form.startPriceWritten}
            onChange={(e) => setForm({ ...form, startPriceWritten: e.target.value })}
          />
        </div>

        <Input
          label="Price per sqft"
          type="number"
          value={form.pricePerSqft}
          onChange={(e) => setForm({ ...form, pricePerSqft: e.target.value })}
        />

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

        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">
            Images
            {editing && <span className="ml-1 font-normal text-gray-400">(leave blank to keep existing)</span>}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {IMAGE_FIELDS.map(({ name, label }) => (
              <div key={name}>
                <label className="block text-xs font-medium text-gray-600">{label}</label>
                <input type="file" accept="image/*" onChange={handleFile(name)} className="mt-1 block w-full text-xs" />
              </div>
            ))}
          </div>
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

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/products', {
        params: debouncedSearch ? { search: debouncedSearch } : {},
      });
      setProducts(data.products || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete product "${row.name}"?`)) return;
    try {
      await api.delete(`/admin/products/${row._id}`);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'startPrice', label: 'Start Price' },
    { key: 'startPriceWritten', label: 'Start Price Written' },
    { key: 'pricePerSqft', label: 'Price per sqft' },
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
        <h1 className="text-2xl font-bold text-brand">Products</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          Add Product
        </Button>
      </div>

      <div className="mt-4 max-w-sm">
        <Input placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4">
        {loading ? (
          <Spinner label="Loading products…" />
        ) : (
          <DataTable columns={columns} rows={products} emptyLabel="No products found." />
        )}
      </div>

      <ProductFormModal
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          fetchProducts();
        }}
      />
    </div>
  );
}
