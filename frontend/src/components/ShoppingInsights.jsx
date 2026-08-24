import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Heart } from 'lucide-react';
import api from '../services/api';
import { formatCurrency } from '../utils/currency';

const ShoppingInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await api.get('/orders/myorders');
        const orders = res.data || [];
        
        if (orders.length > 0) {
          const totalSpent = orders.reduce((acc, order) => acc + order.total, 0);
          const totalOrders = orders.length;
          
          let categories = {};
          orders.forEach(o => {
            if (o.items) {
              o.items.forEach(item => {
                const cat = item.product?.category?.name || 'Electronics';
                categories[cat] = (categories[cat] || 0) + 1;
              });
            }
          });
          
          let favCat = 'N/A';
          let maxCat = 0;
          Object.keys(categories).forEach(c => {
            if (categories[c] > maxCat) {
              maxCat = categories[c];
              favCat = c;
            }
          });
          
          setInsights({ totalSpent, totalOrders, favCat });
        } else {
          setInsights(null); // empty state
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) return <div className="skeleton" style={{ height: '150px' }}></div>;

  return (
    <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bfdbfe', marginBottom: '2rem' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <BarChart2 size={20} /> Your Shopping Insights
      </h3>
      
      {!insights ? (
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>You haven't placed any orders yet. Start shopping to unlock personalized insights!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Orders</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a' }}>{insights.totalOrders}</div>
          </div>
          
          <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Spent</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a' }}>{formatCurrency(insights.totalSpent)}</div>
          </div>
          
          <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Top Category</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Heart size={16} color="#ef4444" /> {insights.favCat}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingInsights;
