import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api.js';

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const res = await adminApi.get('/admin/contacts');
      if (res.success) setContacts(res.data);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateContact = async (id, updates) => {
    try {
      await adminApi.patch(`/admin/contacts/${id}`, updates);
      loadContacts();
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const deleteContact = async () => {
    if (!confirming) return;
    setDeleting(true);
    try {
      await adminApi.delete(`/admin/contacts/${confirming._id}`);
      setContacts((prev) => prev.filter((c) => c._id !== confirming._id));
      setConfirming(null);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
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
      <div>
        <h1 className="font-display text-4xl text-white mb-2">Contacts</h1>
        <p className="text-sm text-noir-muted">{contacts.length} total</p>
      </div>

      <div className="border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10 bg-white/[0.02]">
              <tr>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em] text-noir-muted">Name</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em] text-noir-muted">Email</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em] text-noir-muted">Subject</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em] text-noir-muted">Status</th>
                <th className="px-6 py-4 text-right text-xs uppercase tracking-[0.2em] text-noir-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {contacts.map((contact) => (
                <tr key={contact._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-sm text-white">{contact.name}</td>
                  <td className="px-6 py-4 text-sm text-noir-muted">{contact.email}</td>
                  <td className="px-6 py-4 text-sm text-white">{contact.subject}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 ${contact.resolved ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      {contact.resolved ? 'Resolved' : 'New'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => updateContact(contact._id, { resolved: !contact.resolved })}
                      className="text-xs text-noir-gold hover:text-white transition-colors mr-3"
                    >
                      {contact.resolved ? 'Unresolve' : 'Resolve'}
                    </button>
                    <button
                      onClick={() => setConfirming(contact)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-noir-muted text-sm">
                    No contacts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md border border-white/10 bg-neutral-900 p-8">
            <h3 className="font-display text-xl text-white mb-3">Delete contact?</h3>
            <p className="text-sm text-noir-muted mb-6">
              Are you sure you want to delete the message from “{confirming.name}”? This action cannot be undone.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={deleteContact}
                disabled={deleting}
                className="flex-1 border border-red-500/60 px-6 py-3 text-xs uppercase tracking-[0.25em] text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setConfirming(null)}
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
