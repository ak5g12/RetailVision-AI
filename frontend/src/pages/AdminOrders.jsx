import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data.orders || res.data); // Adjust based on pagination format
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Manage Orders</h1>
      </div>

      <div style={{ background: 'var(--card-bg)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order #</th>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer</th>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Source</th>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</th>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--primary)', fontFamily: 'monospace' }}>{o.orderNumber}</td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '1rem', fontWeight: '500' }}>{o.customer ? o.customer.name : 'Walk-in'}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{o.source}</span>
                </td>
                <td style={{ padding: '1rem', fontWeight: '600' }}>{formatCurrency(o.total)}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '999px', 
                    fontSize: '0.8rem', 
                    fontWeight: '600',
                    background: o.orderStatus === 'COMPLETED' ? '#d1fae5' : o.orderStatus === 'PENDING' ? '#fef3c7' : '#fee2e2',
                    color: o.orderStatus === 'COMPLETED' ? '#065f46' : o.orderStatus === 'PENDING' ? '#92400e' : '#b91c1c'
                  }}>
                    {o.orderStatus}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <Link to={`/orders/${o._id}`} className="btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', display: 'inline-block' }}>View Details</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
