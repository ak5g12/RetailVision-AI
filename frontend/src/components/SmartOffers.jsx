import React, { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';
import api from '../services/api';

const SmartOffers = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await api.get('/coupons/my');
        if (res.data && Array.isArray(res.data)) {
          setCoupons(res.data);
        }
      } catch (err) {
        // user might not be logged in or no coupons
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  if (loading || coupons.length === 0) return null;

  return (
    <div style={{ marginBottom: '5rem', background: 'linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%)', borderRadius: '16px', padding: '2.5rem', border: '1px solid #f5d0fe', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#d946ef', padding: '0.5rem', borderRadius: '8px', color: 'white' }}>
          <Tag size={24} />
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#86198f' }}>Smart Offers For You</h2>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {coupons.map(cpn => (
          <div key={cpn._id} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px dashed #e879f9' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#c026d3', marginBottom: '0.25rem' }}>{cpn.discountPercentage}% OFF</div>
              <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Exclusive retention offer</div>
            </div>
            <div style={{ background: '#faf5ff', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #f3e8ff', fontWeight: 'bold', color: '#9333ea', letterSpacing: '1px' }}>
              {cpn.code}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartOffers;
