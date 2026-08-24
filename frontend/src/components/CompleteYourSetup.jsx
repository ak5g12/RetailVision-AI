import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatCurrency } from '../utils/currency';
import ProductImage from './ProductImage';

const CompleteYourSetup = ({ currentProduct }) => {
  const [setupItems, setSetupItems] = useState([]);
  const [addingAll, setAddingAll] = useState(false);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await api.get('/products');
        let data = res.data.products || res.data;
        if (Array.isArray(data)) {
          // Exclude current product and pick random 4 setup items
          data = data.filter(p => p._id !== currentProduct._id);
          data = data.sort(() => 0.5 - Math.random());
          setSetupItems(data.slice(0, 4));
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (currentProduct) {
      fetchRelated();
    }
  }, [currentProduct]);

  const handleAddAll = async () => {
    setAddingAll(true);
    try {
      for (const item of setupItems) {
        if (item.stock > 0) {
          await api.post('/cart', { productId: item._id, quantity: 1 });
        }
      }
      alert('Added available setup items to cart!');
    } catch (err) {
      alert('Error adding setup to cart');
    } finally {
      setAddingAll(false);
    }
  };

  if (setupItems.length === 0) return null;

  return (
    <div style={{ marginTop: '4rem', background: '#f8fafc', padding: '2.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Complete Your Setup</h3>
        <button 
          onClick={handleAddAll}
          disabled={addingAll}
          style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: addingAll ? 'not-allowed' : 'pointer' }}
        >
          {addingAll ? 'Adding All...' : 'Add All to Cart'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {setupItems.map((p, idx) => (
          <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', flex: 1 }}>
              <Link to={`/products/${p._id}`} style={{ display: 'block', height: '120px', marginBottom: '1rem' }}>
                <ProductImage src={p.images?.[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </Link>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '0.5rem' }}>{p.name}</h4>
              <div style={{ color: '#2563eb', fontWeight: 'bold' }}>{formatCurrency(p.price)}</div>
            </div>
            {idx < setupItems.length - 1 && (
              <div style={{ color: '#94a3b8', fontSize: '1.5rem', fontWeight: 'bold' }}>+</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompleteYourSetup;
