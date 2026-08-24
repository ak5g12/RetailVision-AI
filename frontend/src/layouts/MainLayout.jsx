import React, { useContext, useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShoppingCart, LogOut, Hexagon, User, Menu, X } from 'lucide-react';

const Logo = () => (
  <div className="flex items-center gap-2 text-primary font-bold text-xl">
    <Hexagon className="text-secondary" fill="currentColor" strokeWidth={1} />
    RetailVision<span className="text-muted font-light">_AI</span>
  </div>
);

const MainLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="layout-container">
      <nav style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <Link to="/" onClick={closeMenu}>
          <Logo />
        </Link>

        {/* Desktop Nav */}
        <div className="flex items-center" style={{ display: window.innerWidth < 768 ? 'none' : 'flex', gap: '2rem' }}>
          <Link to="/" className="text-sm font-medium hover:text-secondary">Home</Link>
          <Link to="/products" className="text-sm font-medium hover:text-secondary">Products</Link>
          
          {user ? (
            <>
              {user.role !== 'CUSTOMER' && (
                <Link to="/dashboard" className="text-sm font-medium hover:text-secondary text-primary">Workspace</Link>
              )}
              <Link to="/orders" className="text-sm font-medium hover:text-secondary">Orders</Link>
              <Link to="/profile" className="text-sm font-medium hover:text-secondary">Profile</Link>

              <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>

              <Link to="/cart" className="flex items-center gap-2 hover:text-secondary" style={{ fontWeight: 500 }}>
                <ShoppingCart className="icon-sm" /> Cart
              </Link>

              <div className="flex items-center gap-4 ml-2">
                <div className="flex items-center gap-2 font-medium text-sm">
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  {(user.name || 'User').split(' ')[0]}
                </div>
                <button onClick={handleLogout} className="btn-icon" title="Logout">
                  <LogOut className="icon-sm" />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '1rem', flexShrink: 0 }}>
              <Link to="/login" className="btn-primary text-sm font-medium px-5 py-2.5" style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>Sign In</Link>
              <Link to="/register" className="btn-outline text-sm font-medium px-5 py-2.5" style={{ borderRadius: '6px', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>Create Account</Link>
            </div>
          )}
        </div>
      </nav>
      
      <main className="main-content">
        <Outlet />
      </main>

      <footer style={{ background: 'var(--card-bg)', borderTop: '1px solid var(--border)', padding: '4rem 2rem' }}>
        <div className="container grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          <div>
            <Logo />
            <p className="text-sm text-muted mt-4">
              Intelligent Retail Management & AI-Powered Electronics Commerce. Discover smarter shopping powered by intelligent recommendations and next-generation retail technology.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="flex flex-col gap-2 text-sm text-muted">
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/products?category=new">New Arrivals</Link></li>
              <li><Link to="/products?category=deals">Special Offers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="flex flex-col gap-2 text-sm text-muted">
              <li><Link to="/orders">Track Order</Link></li>
              <li><Link to="/">Returns & Exchanges</Link></li>
              <li><Link to="/">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mt-8 pt-8 text-center text-sm text-muted" style={{ borderTop: '1px solid var(--border-light)' }}>
          &copy; {new Date().getFullYear()} RetailVision_AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
