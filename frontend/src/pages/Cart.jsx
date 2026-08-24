import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import ProductImage from '../components/ProductImage';
import { formatCurrency } from '../utils/currency';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setCart(res.data);
    } catch (err) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        setError('Failed to load cart');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      if (quantity < 1) return;
      const res = await api.put(`/cart/${productId}`, { quantity });
      setCart(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  const removeItem = async (productId) => {
    try {
      const res = await api.delete(`/cart/${productId}`);
      setCart(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove item');
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;
    try {
      await api.delete('/cart');
      setCart({ ...cart, items: [] });
    } catch (err) {
      alert('Failed to clear cart');
    }
  };

  if (loading) return (
    <div className="container py-12 flex justify-center">
      <div className="skeleton" style={{ width: '100%', maxWidth: '1000px', height: '400px' }}></div>
    </div>
  );
  
  if (error) return <div className="container py-8 text-center text-error">{error}</div>;

  const items = cart?.items || [];
  
  if (items.length === 0) {
    return (
      <div className="container py-20 flex flex-col items-center text-center">
        <div className="bg-white p-8 rounded-full border border-border shadow-sm mb-6">
          <ShoppingCart size={48} className="text-muted opacity-50" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Your cart is waiting for something awesome</h2>
        <p className="text-muted mb-8 text-lg max-w-md">Looks like you haven't added anything to your cart yet. Discover our latest electronics and find what you love.</p>
        <Link to="/products" className="btn-primary py-3 px-8 text-lg">
          Start Shopping <ArrowRight className="icon-sm ml-2" />
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  return (
    <div className="container py-12" style={{ maxWidth: '1200px' }}>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-primary">Shopping Cart <span className="text-muted font-normal text-xl ml-2">({items.reduce((acc, i) => acc + i.quantity, 0)} Items)</span></h1>
        <button onClick={clearCart} className="btn-ghost text-error hover:bg-error-bg hover:text-error flex items-center gap-2">
          <Trash2 size={18}/> Clear Cart
        </button>
      </div>

      <div className="grid md:grid-cols-[1fr_350px] gap-8 items-start">
        <div className="flex flex-col gap-6">
          {items.map((item) => (
            <div key={item.product._id} className="card p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
              
              <Link to={`/products/${item.product._id}`} className="bg-white rounded-lg p-2 border border-border flex items-center justify-center shrink-0" style={{ width: '120px', height: '120px' }}>
                 <ProductImage 
                   src={item.product.images && item.product.images.length > 0 ? item.product.images[0] : null} 
                   alt={item.product.name} 
                   style={{width: '100%', height: '100%', objectFit: 'contain'}} 
                 />
              </Link>

              <div className="flex-1 w-full text-center sm:text-left">
                <div className="text-xs text-muted mb-1 font-medium tracking-wide uppercase">{item.product.brand || 'Brand'}</div>
                <h3 className="font-semibold text-lg mb-2">
                  <Link to={`/products/${item.product._id}`} className="hover:text-secondary transition-colors">{item.product.name}</Link>
                </h3>
                <div className="text-lg font-bold text-primary mb-2">{formatCurrency(item.product.price)}</div>
                {item.product.stock < item.quantity && (
                  <div className="inline-flex text-xs font-medium text-warning bg-warning-bg px-2 py-1 rounded-md">Only {item.product.stock} in stock</div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto mt-4 sm:mt-0">
                <div className="flex items-center bg-white rounded-lg border border-border overflow-hidden">
                  <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} disabled={item.quantity <= 1} className="px-3 py-2 hover:bg-gray-50 disabled:opacity-50 text-lg">-</button>
                  <input type="number" value={item.quantity} readOnly className="w-12 text-center border-x border-border py-2 font-semibold bg-transparent" />
                  <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)} disabled={item.quantity >= item.product.stock} className="px-3 py-2 hover:bg-gray-50 disabled:opacity-50 text-lg">+</button>
                </div>

                <div className="font-bold text-xl text-primary w-24 text-right hidden sm:block">
                  {formatCurrency((item.product.price * item.quantity))}
                </div>

                <button onClick={() => removeItem(item.product._id)} className="btn-icon text-error hover:bg-error-bg hover:text-error" title="Remove item">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-6 sticky" style={{ top: '6rem' }}>
          <h3 className="text-xl font-bold mb-6 pb-4 border-b border-border">Order Summary</h3>
          
          <div className="flex justify-between mb-4 text-muted">
            <span>Subtotal</span>
            <span className="text-primary font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between mb-6 text-muted">
            <span>Shipping</span>
            <span className="text-primary font-medium">Calculated at checkout</span>
          </div>

          <div className="flex justify-between my-6 font-bold text-2xl border-t border-border pt-6">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          
          <button onClick={() => navigate('/checkout')} className="btn-primary w-full py-4 text-lg mb-4">
            Proceed to Checkout <ArrowRight className="icon-sm ml-2" />
          </button>
          
          <div className="text-center text-sm text-muted">
            Secure checkout powered by industry standard encryption.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
