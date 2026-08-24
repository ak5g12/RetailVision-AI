import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Package, Plus, Edit, Trash2, X, Upload, Search, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import ProductImage from '../components/ProductImage';
import { formatCurrency } from '../utils/currency';

const AdminProducts = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const initialFormState = {
    name: '', SKU: '', category: '', brand: '', price: '', costPrice: '', stock: '', description: '', active: true, images: []
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async (search = keyword) => {
    try {
      const res = await api.get(`/products?keyword=${search}`);
      setProducts(res.data.products || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e) => {
    setKeyword(e.target.value);
    // Debounce can be added, but for simplicity we fetch on enter or with a small delay.
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts(keyword);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [keyword]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData(initialFormState);
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setIsEditing(true);
    setCurrentId(p._id);
    setFormData({
      name: p.name || '',
      SKU: p.SKU || '',
      category: p.category?._id || p.category || '',
      brand: p.brand || '',
      price: p.price || '',
      costPrice: p.costPrice || '',
      stock: p.stock || '',
      description: p.description || '',
      active: p.active !== undefined ? p.active : true,
      images: p.images || []
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formDataObj = new FormData();
    formDataObj.append('image', file);

    try {
      const res = await api.post('/upload', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, images: [res.data.secure_url] }));
    } catch (err) {
      alert('Image upload failed. Ensure Cloudinary credentials are set in the backend.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        costPrice: Number(formData.costPrice),
        stock: Number(formData.stock)
      };

      if (isEditing) {
        await api.put(`/products/${currentId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      closeModal();
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Manage Products</h1>
        {user?.role !== 'STAFF' && (
          <button className="btn-primary" onClick={openAddModal}><Plus className="icon-sm" /> Add Product</button>
        )}
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <div className="search-bar" style={{ width: '100%', maxWidth: '400px' }}>
          <Search className="icon-sm" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by name or SKU..." 
            value={keyword}
            onChange={handleSearch}
            style={{ width: '100%', paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      <div style={{ background: 'var(--card-bg)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product</th>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category & Brand</th>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price</th>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
              {user?.role !== 'STAFF' && (
                <th style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ProductImage 
                      src={p.images && p.images.length > 0 ? p.images[0] : null} 
                      alt={p.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{p.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.SKU}</div>
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: '500' }}>{p.category?.name || 'Uncategorized'}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.brand}</div>
                </td>
                <td style={{ padding: '1rem', fontWeight: '600' }}>{formatCurrency(p.price)}</td>
                <td style={{ padding: '1rem' }}>
                  {p.stock > 0 ? (
                    <span style={{ background: '#d1fae5', color: '#065f46', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600', display: 'inline-block' }}>In Stock ({p.stock})</span>
                  ) : (
                    <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600', display: 'inline-block' }}>Out of Stock</span>
                  )}
                  {!p.active && (
                    <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', fontWeight: '500' }}>INACTIVE</div>
                  )}
                </td>
                {user?.role !== 'STAFF' && (
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-outline" style={{ padding: '0.4rem 0.6rem', borderRadius: '6px' }} title="Edit" onClick={() => openEditModal(p)}><Edit className="icon-sm"/></button>
                      <button className="btn-logout" style={{ padding: '0.4rem 0.6rem', borderRadius: '6px' }} onClick={() => handleDelete(p._id)} title="Delete"><Trash2 className="icon-sm"/></button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Package className="icon" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No products found matching your search.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--card-bg)', width: '100%', maxWidth: '800px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem' }}>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X /></button>
            </div>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '2rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Image Upload */}
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '120px', height: '120px', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', overflow: 'hidden', position: 'relative' }}>
                    {formData.images && formData.images.length > 0 ? (
                      <ProductImage src={formData.images[0]} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <ImageIcon className="icon text-muted" />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="form-label" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Product Image</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <label className="btn-outline" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Upload className="icon-sm" /> {uploading ? 'Uploading...' : 'Choose Image'}
                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
                      </label>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>JPG, PNG. Max size 5MB. Cloudinary configured.</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label className="form-label">Product Name *</label>
                    <input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <label className="form-label">SKU *</label>
                    <input type="text" name="SKU" className="form-input" value={formData.SKU} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <label className="form-label">Category *</label>
                    <select name="category" className="form-input" value={formData.category} onChange={handleInputChange} required>
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Brand</label>
                    <input type="text" name="brand" className="form-input" value={formData.brand} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="form-label">Selling Price (₹) *</label>
                    <input type="number" step="0.01" min="0" name="price" className="form-input" value={formData.price} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <label className="form-label">Cost Price (₹) *</label>
                    <input type="number" step="0.01" min="0" name="costPrice" className="form-input" value={formData.costPrice} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <label className="form-label">Stock Quantity *</label>
                    <input type="number" min="0" name="stock" className="form-input" value={formData.stock} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <label className="form-label">Profit per Unit (₹)</label>
                    <input type="text" className="form-input" value={formData.price && formData.costPrice ? (formData.price - formData.costPrice).toFixed(2) : '0.00'} disabled style={{ background: '#f8fafc', color: 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <label className="form-label">Profit Margin (%)</label>
                    <input type="text" className="form-input" value={formData.price && formData.price > 0 && formData.costPrice ? (((formData.price - formData.costPrice) / formData.price) * 100).toFixed(1) + '%' : '0.0%'} disabled style={{ background: '#f8fafc', color: 'var(--text-muted)' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                    <input type="checkbox" name="active" id="active" checked={formData.active} onChange={handleInputChange} style={{ width: '1.25rem', height: '1.25rem' }} />
                    <label htmlFor="active" style={{ fontWeight: 600, cursor: 'pointer' }}>Active Product</label>
                  </div>
                  {Number(formData.costPrice) > Number(formData.price) && (
                    <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem', gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertTriangle className="icon-sm" /> Warning: Cost Price is greater than Selling Price.
                    </div>
                  )}
                </div>

                <div>
                  <label className="form-label">Description</label>
                  <textarea name="description" className="form-input" rows="4" value={formData.description} onChange={handleInputChange}></textarea>
                </div>

              </div>
              <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border)', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving || uploading}>
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
