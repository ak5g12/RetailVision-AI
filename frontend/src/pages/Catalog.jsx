import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import ProductImage from '../components/ProductImage';
import { formatCurrency } from '../utils/currency';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [category, sort]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (category) params.append('category', category);
      if (sort) params.append('sort', sort);
      params.append('limit', '1000'); // Ensure all real products are fetched

      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data.products || res.data);
      setError('');
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const skeletonArray = [1, 2, 3, 4, 5, 6];

  return (
    <div className="container py-8">
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Our Products</h1>
          <p className="text-muted">Browse our complete collection of premium electronics.</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex w-full md:w-auto relative" style={{ maxWidth: '400px' }}>
          <input 
            type="text" 
            placeholder="Search products..." 
            className="form-input"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ paddingRight: '3rem', width: '100%' }}
          />
          <button type="submit" className="absolute right-2 top-2 p-1 text-muted hover:text-primary">
            <Search size={20} />
          </button>
        </form>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '240px 1fr', gap: '2rem' }}>
        {/* Sidebar Filters */}
        <aside className="hidden md:block">
          <div className="card p-6 sticky" style={{ top: '6rem' }}>
            <div className="flex items-center gap-2 font-bold text-lg mb-6 pb-4 border-b border-border">
              <SlidersHorizontal size={20} /> Filters
            </div>
            
            <div className="mb-8">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Filter size={16} /> Category</h3>
              <ul className="flex flex-col gap-2">
                <li 
                  className={`cursor-pointer px-3 py-2 rounded-md transition-colors ${!category ? 'bg-secondary text-white font-medium' : 'hover:bg-gray-50 text-muted'}`}
                  onClick={() => setCategory('')}
                >
                  All Categories <span className="float-right bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 text-xs">{categories.reduce((acc, c) => acc + (c.count || 0), 0)}</span>
                </li>
                {categories.map(c => (
                  <li 
                    key={c._id} 
                    className={`cursor-pointer px-3 py-2 rounded-md transition-colors ${category === c._id ? 'bg-secondary text-white font-medium' : 'hover:bg-gray-50 text-muted'}`}
                    onClick={() => setCategory(c._id)}
                  >
                    {c.name} <span className="float-right bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 text-xs">{c.count || 0}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Sort By</h3>
              <select 
                value={sort} 
                onChange={(e) => setSort(e.target.value)} 
                className="form-input cursor-pointer"
              >
                <option value="">Latest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <section>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {loading ? (
              skeletonArray.map(i => (
                <div key={i} className="card p-4 flex flex-col gap-4">
                  <div className="skeleton" style={{ height: '200px', width: '100%' }}></div>
                  <div className="skeleton" style={{ height: '20px', width: '60%' }}></div>
                  <div className="skeleton" style={{ height: '24px', width: '40%' }}></div>
                  <div className="skeleton" style={{ height: '40px', width: '100%', marginTop: 'auto' }}></div>
                </div>
              ))
            ) : error ? (
              <div className="col-span-full p-8 text-center bg-error-bg text-error rounded-lg border border-red-200">
                {error}
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-white rounded-lg border border-border">
                <Search size={48} className="mx-auto mb-4 text-muted opacity-50" />
                <h3 className="text-xl font-bold mb-2">No products found</h3>
                <p className="text-muted">Try adjusting your search or filters to find what you're looking for.</p>
                {(keyword || category) && (
                  <button 
                    onClick={() => { setKeyword(''); setCategory(''); setSort(''); fetchProducts(); }} 
                    className="mt-6 btn-outline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              products.map(p => (
                <div key={p._id} className="card card-hover flex flex-col">
                  <Link to={`/products/${p._id}`} className="block relative bg-white" style={{ height: '240px', padding: '1rem' }}>
                    <ProductImage 
                      src={p.images && p.images.length > 0 ? p.images[0] : null} 
                      alt={p.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                    />
                    {p.stock <= 5 && p.stock > 0 && (
                      <span className="badge badge-warning" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>Low Stock</span>
                    )}
                    {p.stock === 0 && (
                      <span className="badge badge-error" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>Out of Stock</span>
                    )}
                  </Link>
                  <div className="p-5 flex flex-col flex-1 border-t border-border">
                    <div className="text-xs text-muted mb-1 font-medium tracking-wide uppercase flex justify-between">
                      {p.brand || 'Premium'}
                      <span className="text-muted font-normal lowercase">{p.category?.name}</span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2"><Link to={`/products/${p._id}`}>{p.name}</Link></h3>
                    <div className="text-xl font-bold text-primary mb-4">{formatCurrency(p.price)}</div>
                    <div className="mt-auto flex gap-2">
                      <Link to={`/products/${p._id}`} className="btn-outline flex-1 text-sm py-2 text-center">View Details</Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Catalog;
