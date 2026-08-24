import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle, AlertTriangle, Lock, ShieldCheck, CreditCard } from 'lucide-react';
import ProductImage from '../components/ProductImage';
import { formatCurrency } from '../utils/currency';

const Checkout = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const buyNowItem = location.state?.buyNowItem;

  useEffect(() => {
    if (buyNowItem) {
      setCart({
        items: [{
          product: buyNowItem.product,
          quantity: buyNowItem.quantity
        }],
        isBuyNow: true
      });
      setLoading(false);
      return;
    }

    const fetchCart = async () => {
      try {
        const res = await api.get('/cart');
        const couponRes = await api.get('/coupons/my').catch(() => ({ data: [] }));
        setCoupons(couponRes.data);
        setCart(res.data);
      } catch (err) {
        if (err.response?.status !== 401 && err.response?.status !== 403) {
          setError('Failed to load cart for checkout');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [buyNowItem]);

  const handleCheckout = async () => {
    setProcessing(true);
    setError('');
    try {
      const payload = buyNowItem ? { buyNowItem: { productId: buyNowItem.product._id, quantity: buyNowItem.quantity } } : {};
      const res = await api.post('/orders', payload);
      navigate(`/orders/${res.data._id}`);
    } catch (err) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        setError(err.response?.data?.message || 'Checkout failed. Please try again.');
        setProcessing(false);
      }
    }
  };

  const skeletonArray = [1, 2, 3];

  if (loading) return (
    <div className="container py-12 flex justify-center">
      <div className="skeleton" style={{ width: '100%', maxWidth: '1000px', height: '500px' }}></div>
    </div>
  );

  if (error && !cart) return <div className="container py-8 text-center text-error">{error}</div>;

  const items = cart?.items || [];
  
  if (items.length === 0) {
    return (
      <div className="container py-20 flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link to="/products" className="btn-primary py-3 px-8 text-lg">Return to Shop</Link>
      </div>
    );
  }

  // Calculate local subtotal just for display (backend calculates real total)
  const subtotal = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const discountEstimate = appliedCoupon ? (subtotal * appliedCoupon.discountPercentage) / 100 : 0;
  const taxEstimate = (subtotal - discountEstimate) * 0.10;
  const totalEstimate = subtotal - discountEstimate + taxEstimate;

  // Check if any item is out of stock before sending to backend
  const hasStockIssues = items.some(item => item.quantity > item.product.stock);

  return (
    <div className="container py-12" style={{ maxWidth: '1000px' }}>
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
        <Lock className="text-muted" size={28} />
        <h1 className="text-3xl font-bold text-primary">Secure Checkout</h1>
      </div>
      
      {error && (
        <div className="mb-8 p-4 rounded-md text-sm font-medium flex items-center gap-2 bg-error-bg text-error border border-red-200">
          <AlertTriangle size={18} /> {error}
        </div>
      )}
      
      {hasStockIssues && (
        <div className="mb-8 p-4 rounded-md text-sm font-medium flex items-center gap-2 bg-error-bg text-error border border-red-200">
          <AlertTriangle size={18} /> Some items in your cart exceed available stock. Please return to the cart and adjust quantities before checkout.
        </div>
      )}

      <div className="grid md:grid-cols-[1.5fr_1fr] gap-8 items-start">
        <div className="card p-8">
          <h3 className="text-xl font-bold mb-6 pb-4 border-b border-border">Shipping & Billing Information</h3>
          
          <div className="mb-8 text-muted bg-bg-subtle p-4 rounded-lg">
             <p>We'll use your account default details for shipping and billing. This demo bypasses real payment capture and processes your order immediately.</p>
          </div>

          <h3 className="text-xl font-bold mb-6 pb-4 border-b border-border">Payment Method</h3>
          <div className="p-6 border-2 border-primary rounded-xl bg-bg-subtle mb-8 flex items-center justify-between">
            <div>
              <div className="font-bold text-lg mb-1 flex items-center gap-2"><CreditCard size={20}/> Demo Payment</div>
              <div className="text-muted text-sm">No real credit card required.</div>
            </div>
            <ShieldCheck className="text-success" size={32} />
          </div>
          
          <button 
            onClick={handleCheckout} 
            disabled={processing || hasStockIssues}
            className="btn-primary w-full py-4 text-xl"
          >
            {processing ? 'Processing securely...' : <span className="flex items-center justify-center gap-2"><CheckCircle size={24} /> Confirm & Place Order</span>}
          </button>
        </div>

        <div className="card p-6 bg-bg-subtle sticky" style={{ top: '6rem' }}>
          <h3 className="text-xl font-bold mb-6">Order Summary</h3>
          <div className="flex flex-col gap-4 mb-6 pb-6 border-b border-border">
            {items.map(item => (
              <div key={item.product._id} className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="bg-white rounded border border-border flex items-center justify-center shrink-0 p-1" style={{ width: '48px', height: '48px' }}>
                    <ProductImage 
                      src={item.product.images && item.product.images.length > 0 ? item.product.images[0] : null} 
                      alt={item.product.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-sm line-clamp-2 leading-tight mb-1">{item.product.name}</div>
                    <div className="text-xs text-muted">Qty: {item.quantity}</div>
                  </div>
                </div>
                <div className="font-bold text-sm shrink-0 pl-2">
                  {formatCurrency((item.product.price * item.quantity))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between mb-3 text-muted text-sm">
            <span>Subtotal</span>
            <span className="font-medium text-primary">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between mb-6 text-muted text-sm">
            <span>Tax (Estimate)</span>
            <span className="font-medium text-primary">{formatCurrency(taxEstimate)}</span>
          </div>
          <div className="flex justify-between font-bold text-2xl pt-5 border-t border-dashed border-border">
            <span>Total</span>
            <span>{formatCurrency(totalEstimate)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
