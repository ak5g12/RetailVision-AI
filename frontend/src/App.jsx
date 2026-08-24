import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import WorkspaceLayout from './layouts/WorkspaceLayout';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Catalog from './pages/Catalog';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import OrderDetails from './pages/OrderDetails';
import POS from './pages/POS';
import AdminProducts from './pages/AdminProducts';
import AdminCategories from './pages/AdminCategories';
import AdminOrders from './pages/AdminOrders';
import AdminImport from './pages/AdminImport';
import AdminUsers from './pages/AdminUsers';
import Assistant from './pages/Assistant';

import Home from './pages/Home';
import Profile from './pages/Profile';

// Dashboards
import Dashboard from './pages/Dashboard';
import StaffDashboard from './pages/StaffDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';

const Unauthorized = () => <div className="p-8 text-red-500"><h2>Unauthorized</h2><p>You do not have access to this page.</p></div>;

const GlobalAuthModal = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const handleAuthError = () => {
      setIsOpen(true);
    };
    window.addEventListener('retailvision:auth_error', handleAuthError);
    return () => window.removeEventListener('retailvision:auth_error', handleAuthError);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 className="text-2xl font-bold text-primary mb-2">Login Required</h2>
        <p className="text-muted mb-6">Please sign in to your RetailVision_AI account to continue your intelligent retail experience.</p>
        <div className="flex justify-center gap-4">
          <button className="btn-outline" onClick={() => setIsOpen(false)}>Continue Shopping</button>
          <a href="/login" className="btn-primary" onClick={() => setIsOpen(false)}>Sign In</a>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <GlobalAuthModal />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* CUSTOMER LAYOUT */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Catalog />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            
            {/* Protected Customer routes */}
            <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
            <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
            <Route path="/orders" element={<PrivateRoute><OrderHistory /></PrivateRoute>} />
            <Route path="/orders/:id" element={<PrivateRoute><OrderDetails /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          </Route>

          {/* WORKSPACE LAYOUT (STAFF, MANAGER, OWNER, ADMIN) */}
          <Route element={<WorkspaceLayout />}>
            {/* Unified POS Route */}
            <Route path="/pos" element={<PrivateRoute allowedRoles={['STAFF', 'MANAGER', 'OWNER', 'ADMIN']}><POS /></PrivateRoute>} />
            
            {/* Workspaces Profile */}
            <Route path="/workspace/profile" element={<PrivateRoute allowedRoles={['STAFF', 'MANAGER', 'OWNER', 'ADMIN']}><Profile /></PrivateRoute>} />

            {/* DASHBOARDS */}
            {/* Using different paths or letting one /dashboard resolve them. We'll use specific paths and a redirect, or just let them access /dashboard with a dynamic component? No, the plan says separate components. We will route to /dashboard based on role inside the components, or use specific dashboard routes. To make it simple, we'll map them to specific paths and use a generic /dashboard redirect component, OR just map them directly. Let's map them explicitly and let PrivateRoute protect them. But the sidebar links to /dashboard. Let's create an index /dashboard that redirects based on role! */}
            
            {/* Staff Dashboard */}
            <Route path="/dashboard/staff" element={<PrivateRoute allowedRoles={['STAFF']}><StaffDashboard /></PrivateRoute>} />
            
            {/* Manager Dashboard */}
            <Route path="/dashboard/manager" element={<PrivateRoute allowedRoles={['MANAGER']}><Dashboard /></PrivateRoute>} />
            
            {/* Owner Dashboard */}
            <Route path="/dashboard/owner" element={<PrivateRoute allowedRoles={['OWNER']}><OwnerDashboard /></PrivateRoute>} />
            
            {/* Admin Dashboard */}
            <Route path="/dashboard/admin" element={<PrivateRoute allowedRoles={['ADMIN']}><AdminDashboard /></PrivateRoute>} />

            {/* A router that sends /dashboard to the right one */}
            <Route path="/dashboard" element={
              <PrivateRoute allowedRoles={['STAFF', 'MANAGER', 'OWNER', 'ADMIN']}>
                <DashboardRouter />
              </PrivateRoute>
            } />

            {/* Admin Management Routes */}
            <Route path="/admin/products" element={<PrivateRoute allowedRoles={['STAFF', 'MANAGER', 'OWNER', 'ADMIN']}><AdminProducts /></PrivateRoute>} />
            <Route path="/admin/categories" element={<PrivateRoute allowedRoles={['MANAGER', 'OWNER', 'ADMIN']}><AdminCategories /></PrivateRoute>} />
            <Route path="/admin/orders" element={<PrivateRoute allowedRoles={['STAFF', 'MANAGER', 'OWNER', 'ADMIN']}><AdminOrders /></PrivateRoute>} />
            <Route path="/admin/import" element={<PrivateRoute allowedRoles={['MANAGER', 'OWNER', 'ADMIN']}><AdminImport /></PrivateRoute>} />
            
            {/* Only Admins can manage users */}
            <Route path="/admin/users" element={<PrivateRoute allowedRoles={['ADMIN']}><AdminUsers /></PrivateRoute>} />
            
            {/* AI Assistant */}
            <Route path="/assistant" element={<PrivateRoute allowedRoles={['MANAGER', 'OWNER', 'ADMIN']}><Assistant /></PrivateRoute>} />
            
            {/* Analytics (Owner Only) */}
            <Route path="/analytics" element={<PrivateRoute allowedRoles={['OWNER']}><Dashboard /></PrivateRoute>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

const DashboardRouter = () => {
  const { user } = React.useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  switch(user.role) {
    case 'STAFF': return <Navigate to="/dashboard/staff" replace />;
    case 'MANAGER': return <Navigate to="/dashboard/manager" replace />;
    case 'OWNER': return <Navigate to="/dashboard/owner" replace />;
    case 'ADMIN': return <Navigate to="/dashboard/admin" replace />;
    default: return <Navigate to="/" replace />;
  }
};

export default App;
