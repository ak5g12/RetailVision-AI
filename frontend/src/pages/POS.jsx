import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Search, Plus, Trash2, User, CreditCard, Banknote } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

const POS = () => {
  const [keyword, setKeyword] = useState('');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  
  // New Customer Form State
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' });
  const [creatingCustomer, setCreatingCustomer] = useState(false);

  const navigate = useNavigate();

  // Search Products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!keyword) {
        setProducts([]);
        return;
      }
      try {
        const res = await api.get(`/pos/products?keyword=${keyword}`);
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [keyword]);

  // Search Customers
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!customerSearch) {
        setCustomers([]);
        return;
      }
      try {
        const res = await api.get(`/pos/customers?keyword=${customerSearch}`);
        setCustomers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    const delayDebounce = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [customerSearch]);

  const addToCart = (product) => {
    const existing = cart.find(item => item.product === product._id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        alert('Cannot exceed available stock');
        return;
      }
      setCart(cart.map(item => 
        item.product === product._id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      if (product.stock < 1) {
        alert('Product out of stock');
        return;
      }
      setCart([...cart, { product: product._id, name: product.name, price: product.price, quantity: 1, stock: product.stock }]);
    }
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.product === id) {
        const newQty = item.quantity + delta;
        if (newQty < 1 || newQty > item.stock) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.product !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = Math.max(0, subtotal - discount);

  const handleCompleteSale = async () => {
    if (cart.length === 0) return alert('Cart is empty');
    setProcessing(true);
    setError('');
    
    try {
      const payload = {
        items: cart.map(c => ({ productId: c.product, quantity: c.quantity })),
        discount: Number(discount),
        paymentMethod
      };
      if (selectedCustomer) payload.customer = selectedCustomer._id;

      const res = await api.post('/pos/orders', payload);
      alert(`Sale completed! Invoice #${res.data.orderNumber}`);
      
      // Reset POS
      setCart([]);
      setSelectedCustomer(null);
      setCustomerSearch('');
      setKeyword('');
      setDiscount(0);
      setPaymentMethod('CASH');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete sale');
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setCreatingCustomer(true);
    setError('');
    try {
      const res = await api.post('/pos/customers', newCustomer);
      setSelectedCustomer(res.data);
      setShowNewCustomerForm(false);
      setNewCustomer({ name: '', phone: '', email: '' });
      setCustomerSearch('');
      setCustomers([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create customer');
    } finally {
      setCreatingCustomer(false);
    }
  };

  return (
    <div className="pos-page" style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 100px)' }}>
      
      {/* Left side: Product Search & Results */}
      <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
        <h2>Point of Sale</h2>
        <div className="search-bar" style={{ width: '100%' }}>
          <input 
            type="text" 
            placeholder="Scan barcode or search products..." 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', alignContent: 'start' }}>
          {products.map(p => (
            <div key={p._id} className="product-card" style={{ padding: '1.25rem', cursor: 'pointer', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--card-bg)', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'} onClick={() => addToCart(p)}>
              <div style={{ fontWeight: '600', fontSize: '1.05rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>{p.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'monospace' }}>SKU: {p.SKU}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>{formatCurrency(p.price)}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: p.stock > 0 ? '#059669' : '#dc2626', background: p.stock > 0 ? '#d1fae5' : '#fee2e2', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && keyword && <div style={{ color: 'var(--text-muted)' }}>No products found</div>}
        </div>
      </div>

      {/* Right side: Current Sale / Cart */}
      <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Current Sale</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {selectedCustomer ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#eff6ff', padding: '0.5rem 1rem', borderRadius: '6px' }}>
                <span><User className="icon-sm" style={{ display: 'inline', marginRight: '0.5rem' }}/> {selectedCustomer.name} {selectedCustomer.phone ? `(${selectedCustomer.phone})` : ''}</span>
                <button onClick={() => setSelectedCustomer(null)} style={{ border: 'none', background: 'none', color: 'red', cursor: 'pointer' }}>Remove</button>
              </div>
            ) : showNewCustomerForm ? (
              <form onSubmit={handleCreateCustomer} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>New Customer</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  <input type="text" className="input" placeholder="Name *" required value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} style={{ padding: '0.5rem' }} />
                  <input type="text" className="input" placeholder="Phone *" required value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} style={{ padding: '0.5rem' }} />
                  <input type="email" className="input" placeholder="Email (Optional)" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} style={{ padding: '0.5rem' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn-outline" onClick={() => setShowNewCustomerForm(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={creatingCustomer} style={{ flex: 1 }}>{creatingCustomer ? 'Saving...' : 'Save'}</button>
                </div>
              </form>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    className="input"
                    placeholder="Search name, phone, email..." 
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    style={{ padding: '0.5rem', height: '40px', flex: 1 }}
                  />
                  <button onClick={() => setShowNewCustomerForm(true)} className="btn-outline" style={{ padding: '0.5rem', height: '40px' }} title="Create Customer"><Plus className="icon-sm" /></button>
                </div>
                {customers.length > 0 && !selectedCustomer && (
                  <ul style={{ listStyle: 'none', background: 'white', border: '1px solid var(--border)', maxHeight: '150px', overflowY: 'auto', marginTop: '0.5rem', borderRadius: '4px' }}>
                    {customers.map(c => (
                      <li key={c._id} onClick={() => { setSelectedCustomer(c); setCustomers([]); setCustomerSearch(''); }} style={{ padding: '0.5rem', cursor: 'pointer', borderBottom: '1px solid #eee' }}>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.phone ? c.phone : ''} {c.email ? ` | ${c.email}` : ''}</div>
                      </li>
                    ))}
                  </ul>
                )}
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>* Leave empty for Walk-in Customer</div>
              </div>
            )}
          </div>
        </div>

        {error && <div className="alert-error" style={{ margin: '1rem', marginBottom: 0 }}>{error}</div>}

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {cart.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>Cart is empty</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.map(item => (
                <div key={item.product} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid #eee' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600' }}>{item.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{formatCurrency(item.price)}</div>
                  </div>
                  <div className="quantity-selector" style={{ transform: 'scale(0.8)' }}>
                    <button onClick={() => updateQuantity(item.product, -1)}>-</button>
                    <input type="number" value={item.quantity} readOnly />
                    <button onClick={() => updateQuantity(item.product, 1)}>+</button>
                  </div>
                  <div style={{ fontWeight: 'bold', width: '70px', textAlign: 'right' }}>
                    {formatCurrency((item.price * item.quantity))}
                  </div>
                  <button onClick={() => removeFromCart(item.product)} style={{ border: 'none', background: 'none', color: 'red', cursor: 'pointer', marginLeft: '0.5rem' }}><Trash2 className="icon-sm" /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: '#fafafa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
            <span>Discount (₹)</span>
            <input type="number" className="input" min="0" max={subtotal} value={discount} onChange={e => setDiscount(e.target.value)} style={{ width: '100px', padding: '0.5rem', textAlign: 'right', height: '40px' }} />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <button className={`btn-outline ${paymentMethod === 'CASH' ? 'btn-primary' : ''}`} style={{ flex: 1 }} onClick={() => setPaymentMethod('CASH')}><Banknote className="icon-sm"/> Cash</button>
            <button className={`btn-outline ${paymentMethod === 'CARD' ? 'btn-primary' : ''}`} style={{ flex: 1 }} onClick={() => setPaymentMethod('CARD')}><CreditCard className="icon-sm"/> Card</button>
            <button className={`btn-outline ${paymentMethod === 'UPI' ? 'btn-primary' : ''}`} style={{ flex: 1 }} onClick={() => setPaymentMethod('UPI')}>UPI</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '1rem' }}>
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>

          <button onClick={handleCompleteSale} disabled={processing || cart.length === 0} className="btn-primary w-full" style={{ padding: '1rem', fontSize: '1.125rem' }}>
            {processing ? 'Processing...' : 'Complete Sale'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
