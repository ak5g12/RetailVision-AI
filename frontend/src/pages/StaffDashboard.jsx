import React from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Package, ShoppingBag, Clock } from 'lucide-react';

const StaffDashboard = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1>Staff Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        
        <Link to="/pos" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#eff6ff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Monitor size={32} />
            </div>
            <h2 style={{ fontSize: '1.25rem' }}>POS System</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Process walk-in customers and check out items.</p>
          </div>
        </Link>

        <Link to="/admin/products" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={32} />
            </div>
            <h2 style={{ fontSize: '1.25rem' }}>Inventory Search</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Lookup product prices, stock, and details.</p>
          </div>
        </Link>

        <Link to="/admin/orders" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={32} />
            </div>
            <h2 style={{ fontSize: '1.25rem' }}>Recent Orders</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>View and track recent customer orders.</p>
          </div>
        </Link>
      </div>

      <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><Clock className="icon-sm" /> Today's Sales</h2>
        <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '8px', border: '1px dashed var(--border)', textAlign: 'center', color: 'var(--text-muted)' }}>
          Detailed shift metrics are currently only available to Management. Check the Orders page for recent transactions.
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
