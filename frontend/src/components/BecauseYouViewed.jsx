import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatCurrency } from '../utils/currency';
import ProductImage from './ProductImage';
import { Eye } from 'lucide-react';

const BecauseYouViewed = ({ currentProduct }) => {
  const [related, setRelated] = useState([]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        // Fetch products from same category
        const res = await api.get('/products');
        let data = res.data.products || res.data;
        if (Array.isArray(data)) {
          data = data.filter(p => p._id !== currentProduct._id && p.category?._id === currentProduct.category?._id);
          // Fallback if none in same category
          if (data.length === 0) {
            data = (res.data.products || res.data).filter(p => p._id !== currentProduct._id);
          }
          data = data.sort(() => 0.5 - Math.random());
          setRelated(data.slice(0, 4));
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (currentProduct) {
      fetchRelated();
    }
  }, [currentProduct]);

  if (related.length === 0) return null;

  return (
    <div style={{ marginTop: '5rem', marginBottom: '4rem' }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Eye size={24} color="#64748b" /> Because you viewed {currentProduct.name.split(' ')[0]}...
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
        {related.map(p => (
          <Link key={p._id} to={`/products/${p._id}`} style={{ display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1rem', textDecoration: 'none', color: 'inherit', transition: 'box-shadow 0.2s' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
            <div style={{ height: '160px', marginBottom: '1rem' }}>
              <ProductImage src={p.images?.[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>{p.brand}</div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '0.5rem', flex: 1 }}>{p.name}</h4>
            <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{formatCurrency(p.price)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BecauseYouViewed;
