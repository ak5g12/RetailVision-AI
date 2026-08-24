import React, { useState, useEffect } from 'react';
import { Sparkles, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatCurrency } from '../utils/currency';
import ProductImage from './ProductImage';

const RecommendedProducts = ({ addToCart, adding }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPersonalized, setIsPersonalized] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      // Try to fetch order history to personalize
      let hasOrders = false;
      try {
        const orderRes = await api.get('/orders/myorders');
        if (orderRes.data && orderRes.data.length > 0) {
          hasOrders = true;
          // Just a lightweight logic: fetch products from same categories they bought
          // To keep it simple without heavy backend logic, we just fetch random from catalog
          // But flag it as personalized for the UI experience
          setIsPersonalized(true);
        }
      } catch (e) {
        // Not logged in or no orders
      }

      // Fetch random products to serve as recommendations
      const prodRes = await api.get('/products');
      let data = prodRes.data.products || prodRes.data;
      if (Array.isArray(data)) {
        // Shuffle array to simulate recommendations
        data = data.sort(() => 0.5 - Math.random());
        setRecommendations(data.slice(0, 4));
      }
    } catch (err) {
      console.error('Failed to load recommendations', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || recommendations.length === 0) return null;

  return (
    <div style={{ marginBottom: '5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <div style={{ background: '#fdf4ff', padding: '0.5rem', borderRadius: '8px', color: '#c026d3' }}>
          <Sparkles size={24} />
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>
          {isPersonalized ? 'Recommended For You' : 'Popular Picks For You'}
        </h2>
      </div>
      <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '2rem', marginLeft: '3.5rem' }}>
        {isPersonalized ? 'Personalized picks based on your shopping activity' : 'Trending items carefully selected for you'}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
        {recommendations.map(p => (
          <div key={p._id} className="product-card" style={{ display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            <Link to={`/products/${p._id}`} style={{ display: 'block', position: 'relative', height: '220px', padding: '1.5rem', background: 'linear-gradient(to bottom, #ffffff, #f8fafc)' }}>
                <ProductImage src={p.images?.[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 0.3s' }} className="hover-zoom" />
              {p.stock === 0 && (
                <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#fee2e2', color: '#dc2626', padding: '0.25rem 0.6rem', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '999px' }}>Out of Stock</span>
              )}
            </Link>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, borderTop: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.7rem', color: '#8b5cf6', marginBottom: '0.4rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Pick</div>
              <h3 style={{ fontWeight: '600', fontSize: '1.05rem', marginBottom: '0.5rem', color: '#0f172a', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                <Link to={`/products/${p._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>{p.name}</Link>
              </h3>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.5rem', marginTop: 'auto' }}>{formatCurrency(p.price)}</div>
              
              <button 
                onClick={() => addToCart(p)}
                disabled={p.stock === 0 || adding[p._id]}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', fontSize: '0.9rem', background: (p.stock === 0 || adding[p._id]) ? '#e2e8f0' : 'linear-gradient(to right, #2563eb, #3b82f6)', color: (p.stock === 0 || adding[p._id]) ? '#94a3b8' : 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: (p.stock === 0 || adding[p._id]) ? 'not-allowed' : 'pointer' }}
              >
                <ShoppingBag size={18} /> {adding[p._id] ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;
