import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { List, Plus, Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) return <div className="loading">Loading categories...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Manage Categories</h1>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}><Plus className="icon-sm" /> Add Category</button>
      </div>

      <div style={{ background: 'var(--card-bg)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</th>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Slug</th>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>{c.name}</td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.9rem' }}>{c.slug}</td>
                <td style={{ padding: '1rem' }}>
                  {c.active ? (
                    <span style={{ background: '#d1fae5', color: '#065f46', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600' }}>Active</span>
                  ) : (
                    <span style={{ background: '#f3f4f6', color: '#4b5563', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600' }}>Inactive</span>
                  )}
                </td>
                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button className="btn-outline" style={{ padding: '0.4rem 0.6rem', borderRadius: '6px' }} title="Edit"><Edit className="icon-sm"/></button>
                  <button className="btn-logout" style={{ padding: '0.4rem 0.6rem', borderRadius: '6px' }} onClick={() => handleDelete(c._id)} title="Delete"><Trash2 className="icon-sm"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-xl)', width: '90%', maxWidth: '400px', boxShadow: 'var(--shadow-lg)' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Add Category</h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={newCatName} 
                onChange={e => { setNewCatName(e.target.value); setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')); }} 
                placeholder="e.g. Laptops" 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Slug (Auto-generated)</label>
              <input 
                type="text" 
                className="form-control" 
                value={newCatSlug} 
                onChange={e => setNewCatSlug(e.target.value)} 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: '#f8fafc' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                className="btn-outline" 
                onClick={() => { setShowAddModal(false); setNewCatName(''); setNewCatSlug(''); }}
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={async () => {
                  if (!newCatName || !newCatSlug) return alert('Name and Slug are required');
                  setSaving(true);
                  try {
                    await api.post('/categories', { name: newCatName, slug: newCatSlug });
                    fetchCategories();
                    setShowAddModal(false);
                    setNewCatName('');
                    setNewCatSlug('');
                  } catch (err) {
                    alert(err.response?.data?.message || 'Error saving category');
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
