import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api.js';
import ImageUpload from '../../components/admin/ImageUpload.jsx';
import useTableControls from '../../hooks/useTableControls.js';

const defaultFields = {
  name: { type: 'text', label: 'Name', required: true },
  slug: { type: 'text', label: 'Slug' },
  description: { type: 'textarea', label: 'Description' },
  image: { type: 'image', label: 'Image' },
  active: { type: 'checkbox', label: 'Active', default: true },
  featured: { type: 'checkbox', label: 'Featured', default: false },
};

/** Sortable column header with an indicator arrow. */
function SortHeader({ label, name, activeKey, dir, onSort, align = 'left' }) {
  const active = activeKey === name;
  return (
    <th className={`px-6 py-4 text-xs uppercase tracking-[0.2em] ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <button
        type="button"
        onClick={() => onSort(name)}
        className={`inline-flex items-center gap-1.5 transition-colors ${active ? 'text-noir-gold' : 'text-noir-muted hover:text-noir-gold'}`}
      >
        {label}
        <span className="text-[0.7em]">{active ? (dir === 'asc' ? '↑' : '↓') : '↕'}</span>
      </button>
    </th>
  );
}

export default function CrudPage({
  title,
  endpoint,
  fields = {},
  transform = (item) => item,
  reverseTransform = (data) => data,
  emptyMessage = 'No items yet.',
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState(null); // item awaiting delete confirmation
  const [deleteError, setDeleteError] = useState('');
  const [deletingInProgress, setDeletingInProgress] = useState(false);
  const [notice, setNotice] = useState('');

  const mergedFields = { ...defaultFields, ...fields };

  const {
    rows,
    query,
    setQuery,
    filterValues,
    setFilter,
    clearAll,
    sortKey,
    sortDir,
    toggleSort,
  } = useTableControls(items, {
    searchFields: [
      (i) => i.name || i.title || i.question || i.code || '',
      (i) => i.slug || '',
    ],
    filters: {
      active: (i) => (i.active ? 'active' : 'inactive'),
      featured: (i) => (i.featured ? 'featured' : 'standard'),
    },
    sortAccessors: {
      name: (i) => i.name || i.title || i.question || i.code || '',
      active: (i) => (i.active ? 0 : 1),
      featured: (i) => (i.featured ? 0 : 1),
    },
  });
  const hasActiveControls =
    query.trim() !== '' || Object.keys(filterValues).some((k) => filterValues[k] && filterValues[k] !== 'all');

  const showNotice = (msg) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(''), 4000);
  };

  useEffect(() => {
    loadItems();
  }, [endpoint]);

  const loadItems = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await adminApi.get(`/admin/${endpoint}`);
      if (res.success) setItems(res.data.map(transform));
      else throw new Error(res.message || 'Unable to load items.');
    } catch (err) {
      setLoadError('Unable to load items.');
    } finally {
      setLoading(false);
    }
  };

  const initialFormData = () => {
    const initial = {};
    Object.entries(mergedFields).forEach(([key, config]) => {
      if (config.type === 'hidden') return;
      initial[key] = config.default ?? (config.type === 'checkbox' ? false : '');
    });
    return initial;
  };

  /** Return a map of field -> error message, or null if valid. */
  const validate = (data) => {
    const errors = {};
    Object.entries(mergedFields).forEach(([key, config]) => {
      const val = data[key];
      if (config.required) {
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          errors[key] = `${config.label || key} is required`;
        }
      }
      if (config.type === 'number' && val !== '' && val !== undefined && val !== null) {
        const num = Number(val);
        if (Number.isNaN(num)) {
          errors[key] = `${config.label || key} must be a number`;
        } else {
          if (config.integer && !Number.isInteger(num)) {
            errors[key] = `${config.label || key} must be a whole number`;
          }
          if (config.min !== undefined && num < config.min) {
            errors[key] = `${config.label || key} must be ${config.minMessage || `greater than or equal to ${config.min}`}`;
          }
        }
      }
    });
    return Object.keys(errors).length ? errors : null;
  };

  const handleCreate = () => {
    setFormData(initialFormData());
    setEditing(null);
    setFormError('');
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setFormData({ ...item });
    setEditing(item);
    setFormError('');
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeletingInProgress(true);
    setDeleteError('');
    try {
      await adminApi.delete(`/admin/${endpoint}/${deleting._id}`);
      setItems((prev) => prev.filter((i) => i._id !== deleting._id));
      setDeleting(null);
      showNotice('Item deleted.');
    } catch (err) {
      setDeleteError(err.message || 'Delete failed.');
    } finally {
      setDeletingInProgress(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const payloadRaw = reverseTransform(formData);

    // Coerce numeric fields and validate.
    const payload = { ...payloadRaw };
    // Strip computed/meta fields that must not be sent on create/update.
    delete payload._id;
    delete payload.__v;
    delete payload.createdAt;
    delete payload.updatedAt;
    Object.entries(mergedFields).forEach(([key, config]) => {
      if (config.type === 'number' && payload[key] !== '' && payload[key] !== undefined && payload[key] !== null) {
        payload[key] = Number(payload[key]);
      }
    });

    const errors = validate(payload);
    if (errors) {
      setFormError(Object.values(errors)[0]);
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await adminApi.patch(`/admin/${endpoint}/${editing._id}`, payload);
        showNotice('Item updated.');
      } else {
        await adminApi.post(`/admin/${endpoint}`, payload);
        showNotice('Item created.');
      }
      setShowModal(false);
      await loadItems();
    } catch (err) {
      setFormError(err.message || 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-noir-gold text-sm uppercase tracking-[0.3em]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notice && (
        <div className="border border-green-500/50 bg-green-500/10 text-green-400 px-4 py-3 text-sm">
          {notice}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-white mb-2">{title}</h1>
          <p className="text-sm text-noir-muted">{items.length} items total{hasActiveControls ? ` · ${rows.length} shown` : ''}</p>
        </div>
        <button
          onClick={handleCreate}
          className="border border-noir-gold px-6 py-3 text-xs uppercase tracking-[0.25em] text-noir-gold hover:bg-noir-gold hover:text-black transition-all duration-500"
        >
          + Add New
        </button>
      </div>

      {/* Search + filter toolbar */}
      <div className="flex flex-col gap-3 border border-white/10 bg-white/[0.02] p-4 lg:flex-row lg:items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${title.toLowerCase()}…`}
          className="flex-1 bg-transparent border border-white/20 px-4 py-2.5 text-sm text-white placeholder:text-noir-muted focus:border-noir-gold focus:outline-none"
        />
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterValues.active || 'all'}
            onChange={(e) => setFilter('active', e.target.value)}
            className="bg-neutral-900 border border-white/20 px-3 py-2.5 text-xs text-white focus:border-noir-gold focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active" className="bg-black">Active</option>
            <option value="inactive" className="bg-black">Inactive</option>
          </select>
          <select
            value={filterValues.featured || 'all'}
            onChange={(e) => setFilter('featured', e.target.value)}
            className="bg-neutral-900 border border-white/20 px-3 py-2.5 text-xs text-white focus:border-noir-gold focus:outline-none"
          >
            <option value="all">All Featured</option>
            <option value="featured" className="bg-black">Featured</option>
            <option value="standard" className="bg-black">Standard</option>
          </select>
          {hasActiveControls && (
            <button onClick={clearAll} className="text-xs uppercase tracking-wider text-noir-muted hover:text-white transition-colors">
              Clear
            </button>
          )}
        </div>
      </div>

      {loadError ? (
        <div className="border border-white/10 bg-white/[0.02] p-10 text-center">
          <p className="text-sm text-red-400">{loadError}</p>
          <button
            onClick={loadItems}
            className="mt-4 border border-noir-gold px-6 py-2 text-xs uppercase tracking-[0.25em] text-noir-gold hover:bg-noir-gold hover:text-black transition-all duration-500"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10 bg-white/[0.02]">
                <tr>
                  <SortHeader label="Name" name="name" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortHeader label="Status" name="active" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortHeader label="Featured" name="featured" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <th className="px-6 py-4 text-right text-xs uppercase tracking-[0.2em] text-noir-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-10 h-10 object-cover border border-white/10" />
                        )}
                        <div>
                          <p className="text-sm text-white">{item.name || item.title || item.question || item.code || '—'}</p>
                          {item.slug && <p className="text-xs text-noir-muted">{item.slug}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 ${item.active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {item.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 ${item.featured ? 'bg-noir-gold/10 text-noir-gold' : 'bg-white/5 text-white/50'}`}>
                        {item.featured ? 'Featured' : 'Standard'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-xs text-noir-gold hover:text-white transition-colors mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { setDeleting(item); setDeleteError(''); }}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-noir-muted text-sm">
                      {items.length === 0 ? emptyMessage : 'No items match your filters'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10 bg-neutral-900">
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
              <h2 className="font-display text-2xl text-white">
                {editing ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/60 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {formError && (
                <div className="p-4 border border-red-500/50 bg-red-500/10 text-red-400 text-sm">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(mergedFields).filter(([, c]) => c.type !== 'hidden').map(([key, config]) => (
                  <div key={key} className={config.type === 'image' || config.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <div className="mb-2 text-xs uppercase tracking-[0.2em] text-noir-muted">
                      {config.label}
                      {config.required && <span className="text-red-400 ml-1">*</span>}
                    </div>

                    {config.type === 'image' ? (
                      <ImageUpload
                        value={formData[key] || ''}
                        onChange={(url) => handleInputChange(key, url)}
                        label={config.label}
                        required={config.required}
                      />
                    ) : config.type === 'textarea' ? (
                      <textarea
                        value={formData[key] || ''}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        rows={4}
                        className="w-full bg-transparent border border-white/20 px-4 py-3 text-white focus:border-noir-gold focus:outline-none transition-colors resize-none"
                        required={config.required}
                      />
                    ) : config.type === 'checkbox' ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData[key] || false}
                          onChange={(e) => handleInputChange(key, e.target.checked)}
                          className="w-4 h-4 accent-noir-gold"
                        />
                        <span className="text-sm text-white">{config.label}</span>
                      </label>
                    ) : config.type === 'select' ? (
                      <select
                        value={formData[key] || ''}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="w-full cursor-pointer bg-transparent border border-white/20 px-4 py-3 text-white focus:border-noir-gold focus:outline-none transition-colors"
                        required={config.required}
                      >
                        {(config.options || []).map((o) => (
                          <option key={o.value} value={o.value} className="bg-black text-white">
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={config.type}
                        value={formData[key] || ''}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="w-full bg-transparent border border-white/20 px-4 py-3 text-white focus:border-noir-gold focus:outline-none transition-colors"
                        required={config.required}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 border border-noir-gold px-8 py-3.5 text-xs uppercase tracking-[0.25em] text-noir-gold hover:bg-noir-gold hover:text-black transition-all duration-500 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-8 py-3.5 text-xs uppercase tracking-[0.25em] text-white/70 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md border border-white/10 bg-neutral-900 p-8">
            <h3 className="font-display text-xl text-white mb-3">Delete {title.slice(0, -1)}?</h3>
            <p className="text-sm text-noir-muted mb-6">
              Are you sure you want to delete “{deleting.name || deleting.title || 'this item'}”? This action cannot be undone.
            </p>
            {deleteError && (
              <div className="mb-4 p-4 border border-red-500/50 bg-red-500/10 text-red-400 text-sm">
                {deleteError}
              </div>
            )}
            <div className="flex items-center gap-4">
              <button
                onClick={handleDelete}
                disabled={deletingInProgress}
                className="flex-1 border border-red-500/60 px-6 py-3 text-xs uppercase tracking-[0.25em] text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 disabled:opacity-50"
              >
                {deletingInProgress ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setDeleting(null)}
                className="flex-1 px-6 py-3 text-xs uppercase tracking-[0.25em] text-white/70 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
