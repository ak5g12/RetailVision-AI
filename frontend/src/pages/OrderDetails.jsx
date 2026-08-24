import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, Package } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

const OrderDetails = () => {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const endpoint = user?.role === 'CUSTOMER' 
          ? `/orders/myorders/${id}` 
          : `/orders/${id}`;
        const res = await api.get(endpoint);
        setOrder(res.data);
      } catch (err) {
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, user]);

  const handleUpdateStatus = async (newStatus) => {
    if (!window.confirm(`Update order status to ${newStatus}?`)) return;
    try {
      const res = await api.put(`/orders/${id}/status`, { orderStatus: newStatus });
      setOrder(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) return <div className="loading">Loading order...</div>;
  if (error) return <div className="alert-error">{error}</div>;
  if (!order) return <div className="empty-state">Order not found.</div>;

  return (
    <div className="cart-page" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/orders" className="back-link" style={{ fontSize: '0.95rem' }}><ArrowLeft className="icon-sm"/> Back to Orders</Link>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Order #{order.orderNumber}</h1>
          <p style={{ color: 'var(--text-muted)' }}>Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '0.75rem', fontWeight: '600', fontSize: '0.85rem' }}>
            <span className={`stock ${order.orderStatus === 'COMPLETED' ? 'in-stock' : 'out-of-stock'}`} style={{ padding: '0.35rem 1rem', borderRadius: '999px' }}>{order.orderStatus}</span>
            <span className="stock" style={{ background: '#e0e7ff', color: '#3730a3', padding: '0.35rem 1rem', borderRadius: '999px', border: '1px solid #c7d2fe' }}>{order.paymentStatus}</span>
          </div>
          {user?.role !== 'CUSTOMER' && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <select 
                className="input" 
                style={{ height: '36px', padding: '0 0.5rem' }}
                value={order.orderStatus} 
                onChange={(e) => handleUpdateStatus(e.target.value)}
              >
                <option value="PENDING">PENDING</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2.5rem', marginTop: '1rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 2, background: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', fontSize: '1.25rem' }}>Items Ordered</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {order.items.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <div style={{ width: '60px', height: '60px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package className="icon-sm text-muted" />
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '1.05rem', marginBottom: '0.25rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Quantity: {item.quantity}</div>
                  </div>
                </div>
                <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                  {formatCurrency((item.price * item.quantity))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, background: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', height: 'fit-content', position: 'sticky', top: '100px' }}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', fontSize: '1.25rem' }}>Order Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            <span>Tax</span>
            <span>{formatCurrency(order.tax)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
            <span>Discount</span>
            <span>-{formatCurrency(order.discount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.5rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border)' }}>
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
