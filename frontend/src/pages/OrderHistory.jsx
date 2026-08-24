import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Package, ArrowRight, ExternalLink } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/myorders');
        setOrders(res.data);
      } catch (err) {
        setError('Failed to load order history');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const skeletonArray = [1, 2, 3];

  if (loading) return (
    <div className="container py-12" style={{ maxWidth: '1000px' }}>
      <h1 className="text-3xl font-bold mb-8">My Order History</h1>
      <div className="flex flex-col gap-6">
        {skeletonArray.map(i => (
          <div key={i} className="skeleton" style={{ height: '140px', width: '100%' }}></div>
        ))}
      </div>
    </div>
  );

  if (error) return <div className="container py-8 text-center text-error">{error}</div>;

  if (orders.length === 0) {
    return (
      <div className="container py-20 flex flex-col items-center text-center">
        <div className="bg-white p-8 rounded-full border border-border shadow-sm mb-6">
          <Package size={48} className="text-muted opacity-50" />
        </div>
        <h2 className="text-2xl font-bold mb-4">No Orders Found</h2>
        <p className="text-muted mb-8 text-lg max-w-md">You haven't placed any orders yet. Once you do, you'll be able to track them here.</p>
        <Link to="/products" className="btn-primary py-3 px-8 text-lg">
          Start Shopping <ArrowRight className="icon-sm ml-2" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-12" style={{ maxWidth: '1000px' }}>
      <h1 className="text-3xl font-bold text-primary mb-8 pb-6 border-b border-border">My Order History</h1>
      
      <div className="flex flex-col gap-6">
        {orders.map(order => (
          <div key={order._id} className="card card-hover p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex gap-6 items-center">
              <div className="bg-bg-subtle text-primary shrink-0 rounded-full flex items-center justify-center" style={{ width: '64px', height: '64px' }}>
                <Package size={28} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Order #{order.orderNumber}</h3>
                <p className="text-muted text-sm mb-3">Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className={`badge ${order.orderStatus === 'COMPLETED' ? 'badge-success' : order.orderStatus === 'CANCELLED' ? 'badge-error' : 'badge-warning'}`}>
                    {order.orderStatus}
                  </span>
                  <span className="badge" style={{ background: '#e0e7ff', color: '#3730a3' }}>
                    {order.paymentStatus}
                  </span>
                  <span className="badge" style={{ background: order.source === 'POS' ? '#fef3c7' : '#dbeafe', color: order.source === 'POS' ? '#92400e' : '#1e40af' }}>
                    {order.source}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-left sm:text-right w-full sm:w-auto border-t sm:border-t-0 border-border pt-4 sm:pt-0 mt-2 sm:mt-0">
              <div className="text-sm text-muted mb-1">Total Amount</div>
              <div className="font-bold text-2xl text-primary mb-4">{formatCurrency(order.total)}</div>
              <Link to={`/orders/${order._id}`} className="btn-outline text-sm w-full sm:w-auto flex justify-center">
                View Details <ExternalLink size={16} className="ml-2" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
