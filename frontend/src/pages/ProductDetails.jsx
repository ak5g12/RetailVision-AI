import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, ShoppingCart, CheckCircle, XCircle, AlertTriangle, CreditCard } from 'lucide-react';
import ProductImage from '../components/ProductImage';
import CompleteYourSetup from '../components/CompleteYourSetup';
import BecauseYouViewed from '../components/BecauseYouViewed';
import { AuthContext } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('retailvision:auth_error'));
      return;
    }
    setAdding(true);
    try {
      await api.post('/cart', { productId: product._id, quantity });
      alert(`Successfully added ${quantity} to cart!`);
    } catch (err) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        alert(err.response?.data?.message || 'Failed to add item to cart');
      }
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('retailvision:auth_error'));
      return;
    }
    navigate('/checkout', {
      state: {
        buyNowItem: {
          product: product,
          quantity: quantity
        }
      }
    });
  };

  if (loading) return (
    <div className="container py-8">
      <div className="skeleton" style={{ height: '400px', width: '100%' }}></div>
    </div>
  );
  if (error) return <div className="container py-8 text-center text-error">{error}</div>;
  if (!product) return <div className="container py-8 text-center text-muted">Product not found.</div>;

  // Determine Stock Status
  let stockStatus = null;
  if (product.stock === 0) {
    stockStatus = <span className="badge badge-error text-sm py-1 px-3"><XCircle size={16} className="mr-1 inline" /> Out of Stock</span>;
  } else if (product.stock <= 5) {
    stockStatus = <span className="badge badge-warning text-sm py-1 px-3"><AlertTriangle size={16} className="mr-1 inline" /> Low Stock (Only {product.stock} left)</span>;
  } else {
    stockStatus = <span className="badge badge-success text-sm py-1 px-3"><CheckCircle size={16} className="mr-1 inline" /> In Stock</span>;
  }

  return (
    <div className="container py-8">
      <Link to="/products" className="inline-flex items-center text-muted hover:text-primary mb-8 font-medium">
        <ArrowLeft className="icon-sm mr-2"/> Back to Products
      </Link>
      
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '4rem' }}>
        <div className="bg-white rounded-2xl border border-border p-8 flex items-center justify-center" style={{ height: '500px' }}>
          <ProductImage 
            src={product.images && product.images.length > 0 ? product.images[0] : null} 
            alt={product.name} 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
          />
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-bold tracking-wider text-secondary uppercase">{product.brand || 'Premium'}</span>
            <span className="text-sm text-muted">•</span>
            <span className="text-sm text-muted">{product.category?.name || 'Electronics'}</span>
          </div>
          
          <h1 className="text-4xl font-bold text-primary mb-4" style={{ lineHeight: 1.2 }}>{product.name}</h1>
          <div className="text-sm text-muted mb-6">SKU: {product.SKU || 'N/A'}</div>
          
          <div className="flex items-center gap-6 mb-8">
            <span className="text-4xl font-bold text-primary">{formatCurrency(product.price)}</span>
            {stockStatus}
          </div>
          
          <p className="text-lg text-muted mb-8" style={{ lineHeight: 1.6 }}>{product.description}</p>
          
          <div className="flex items-center gap-4 mb-8 p-6 rounded-xl" style={{ background: 'var(--bg-subtle)' }}>
            <div className="flex items-center bg-white rounded-lg border border-border overflow-hidden">
              <button 
                className="px-4 py-3 hover:bg-gray-50 disabled:opacity-50"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >-</button>
              <input 
                type="number" 
                value={quantity} 
                readOnly 
                className="w-16 text-center border-x border-border py-3 font-semibold text-lg bg-transparent"
                style={{ outline: 'none' }}
              />
              <button 
                className="px-4 py-3 hover:bg-gray-50 disabled:opacity-50"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock || product.stock === 0}
              >+</button>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                <button 
                  className="btn-outline flex-1 py-4 text-lg font-semibold" 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || adding}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <ShoppingCart className="mr-2"/> {adding ? 'Adding...' : 'Add to Cart'}
                </button>
                <button 
                  className="btn-primary flex-1 py-4 text-lg font-semibold" 
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <CreditCard className="mr-2"/> Buy Now
                </button>
              </div>
          </div>
          
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="mt-8 border-t border-border pt-8">
              <h3 className="text-xl font-bold mb-4">Specifications</h3>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-sm text-muted">{key}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <CompleteYourSetup currentProduct={product} />
      <BecauseYouViewed currentProduct={product} />
    </div>
  );
};

export default ProductDetails;
