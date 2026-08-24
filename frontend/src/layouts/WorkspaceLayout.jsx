import React, { useContext, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import { 
  Hexagon, LayoutDashboard, ShoppingCart, ShoppingBag, 
  Users, BarChart2, UploadCloud, Monitor, 
  LogOut, User, Menu, X, BrainCircuit, Package
} from 'lucide-react';

const Logo = () => (
  <div className="flex items-center gap-2 text-primary font-bold text-xl">
    <Hexagon className="text-secondary" fill="currentColor" strokeWidth={1} />
    RetailVision<span className="text-muted font-light">_AI</span>
  </div>
);

const WorkspaceLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const renderNavLinks = () => {
    if (!user) return null;

    const navItems = [];

    // STAFF
    if (user.role === 'STAFF') {
      navItems.push({ label: 'Staff Dashboard', path: '/dashboard', icon: <LayoutDashboard className="icon-sm" /> });
      navItems.push({ label: 'POS System', path: '/pos', icon: <Monitor className="icon-sm" /> });
      navItems.push({ label: 'Products', path: '/admin/products', icon: <Package className="icon-sm" /> });
      navItems.push({ label: 'Orders', path: '/admin/orders', icon: <ShoppingBag className="icon-sm" /> });
    }

    // MANAGER
    if (user.role === 'MANAGER') {
      navItems.push({ label: 'Management Dashboard', path: '/dashboard', icon: <LayoutDashboard className="icon-sm" /> });
      navItems.push({ label: 'Products', path: '/admin/products', icon: <Package className="icon-sm" /> });
      navItems.push({ label: 'Categories', path: '/admin/categories', icon: <Package className="icon-sm" /> });
      navItems.push({ label: 'Orders', path: '/admin/orders', icon: <ShoppingBag className="icon-sm" /> });
      navItems.push({ label: 'POS System', path: '/pos', icon: <Monitor className="icon-sm" /> });
      navItems.push({ label: 'Historical Import', path: '/admin/import', icon: <UploadCloud className="icon-sm" /> });
      navItems.push({ label: 'AI Assistant', path: '/assistant', icon: <BrainCircuit className="icon-sm" /> });
    }

    // OWNER
    if (user.role === 'OWNER') {
      navItems.push({ label: 'Owner Dashboard', path: '/dashboard', icon: <BarChart2 className="icon-sm" /> });
      navItems.push({ label: 'Products', path: '/admin/products', icon: <Package className="icon-sm" /> });
      navItems.push({ label: 'Categories', path: '/admin/categories', icon: <Package className="icon-sm" /> });
      navItems.push({ label: 'Orders', path: '/admin/orders', icon: <ShoppingBag className="icon-sm" /> });
      navItems.push({ label: 'POS System', path: '/pos', icon: <Monitor className="icon-sm" /> });
      navItems.push({ label: 'Analytics', path: '/analytics', icon: <BarChart2 className="icon-sm" /> }); // If separate analytics page exists, or just dashboard
      navItems.push({ label: 'Historical Import', path: '/admin/import', icon: <UploadCloud className="icon-sm" /> });
      navItems.push({ label: 'AI Assistant', path: '/assistant', icon: <BrainCircuit className="icon-sm" /> });
    }

    // ADMIN
    if (user.role === 'ADMIN') {
      navItems.push({ label: 'Admin Console', path: '/dashboard', icon: <LayoutDashboard className="icon-sm" /> });
      navItems.push({ label: 'Users & Roles', path: '/admin/users', icon: <Users className="icon-sm" /> });
      navItems.push({ label: 'Products', path: '/admin/products', icon: <Package className="icon-sm" /> });
      navItems.push({ label: 'Categories', path: '/admin/categories', icon: <Package className="icon-sm" /> });
      navItems.push({ label: 'Orders', path: '/admin/orders', icon: <ShoppingBag className="icon-sm" /> });
      navItems.push({ label: 'POS System', path: '/pos', icon: <Monitor className="icon-sm" /> });
      navItems.push({ label: 'Historical Import', path: '/admin/import', icon: <UploadCloud className="icon-sm" /> });
      navItems.push({ label: 'AI Assistant', path: '/assistant', icon: <BrainCircuit className="icon-sm" /> });
    }

    // Common
    navItems.push({ label: 'Profile', path: '/workspace/profile', icon: <User className="icon-sm" /> });

    // Deduplicate (in case roles bleed, though we use exclusive ifs here)
    const uniqueNavItems = Array.from(new Set(navItems.map(a => a.path)))
      .map(path => {
        return navItems.find(a => a.path === path)
      });

    return uniqueNavItems.map((item) => (
      <Link 
        key={item.path} 
        to={item.path} 
        onClick={closeSidebar}
        className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem', 
          padding: '0.75rem 1rem', borderRadius: '8px', 
          color: isActive(item.path) ? 'var(--primary)' : 'var(--text-muted)',
          background: isActive(item.path) ? '#eff6ff' : 'transparent',
          textDecoration: 'none',
          fontWeight: isActive(item.path) ? '600' : '500',
          marginBottom: '0.25rem',
          transition: 'all 0.2s'
        }}
      >
        {item.icon}
        {item.label}
      </Link>
    ));
  };

  const getWorkspaceTitle = () => {
    switch(user?.role) {
      case 'ADMIN': return 'Admin Console';
      case 'OWNER': return 'Owner Workspace';
      case 'MANAGER': return 'Manager Workspace';
      case 'STAFF': return 'Staff Workspace';
      default: return 'Workspace';
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-main)' }}>
      {/* Mobile Header */}
      <div className="mobile-workspace-header" style={{ display: 'none', position: 'fixed', top: 0, left: 0, right: 0, height: '60px', background: '#fff', borderBottom: '1px solid var(--border)', zIndex: 50, alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
          <Logo />
        </div>
        <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <Menu />
        </button>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div onClick={closeSidebar} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90 }} />
      )}

      {/* Sidebar */}
      <aside className={`workspace-sidebar ${sidebarOpen ? 'open' : ''}`} style={{ 
        width: '260px', background: '#fff', borderRight: '1px solid var(--border)', 
        display: 'flex', flexDirection: 'column', zIndex: 100, transition: 'transform 0.3s ease'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Logo />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              {getWorkspaceTitle()}
            </div>
          </Link>
          <button className="mobile-close-btn" onClick={closeSidebar} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X />
          </button>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1rem' }}>
          {renderNavLinks()}
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold' }}>
              {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.name || 'User'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-outline w-full" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
            <LogOut className="icon-sm" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', background: '#f1f5f9', padding: '2rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .workspace-sidebar {
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            transform: translateX(-100%);
          }
          .workspace-sidebar.open {
            transform: translateX(0);
          }
          .mobile-workspace-header {
            display: flex !important;
          }
          .mobile-close-btn {
            display: block !important;
          }
          main {
            padding-top: 5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default WorkspaceLayout;
