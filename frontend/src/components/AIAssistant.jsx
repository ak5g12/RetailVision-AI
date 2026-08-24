import React, { useState } from 'react';
import { BrainCircuit, Search, ArrowRight, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatCurrency } from '../utils/currency';

const AIAssistant = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const navigate = useNavigate();

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!query) return;
    
    setLoading(true);
    try {
      // Lightweight rule-based matching using the existing product search
      // Example rule: budget check
      const budgetMatch = query.match(/under\\s*(\\d+)/i) || query.match(/less than\\s*(\\d+)/i) || query.match(/cheap/i);
      // Example rule: categories
      let keyword = query.replace(/(recommend|find|suggest|show me|i need|looking for)/gi, '').trim();
      
      const res = await api.get(`/products?keyword=${encodeURIComponent(keyword)}`);
      let products = res.data.products || res.data;
      
      if (Array.isArray(products)) {
        if (budgetMatch && budgetMatch[1]) {
           const budget = parseFloat(budgetMatch[1]);
           products = products.filter(p => p.price <= budget);
        }
        setResults({
          message: products.length > 0 ? `I found ${products.length} products matching your request:` : "I couldn't find exact products for that, but here's what you can explore.",
          products: products.slice(0, 4)
        });
      }
    } catch (err) {
      console.error(err);
      setResults({ message: "Sorry, I'm having trouble searching right now." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', borderRadius: '16px', padding: '2.5rem', color: 'white', marginBottom: '4rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.1, transform: 'scale(2)' }}>
         <Cpu size={200} />
      </div>
      
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ background: 'linear-gradient(45deg, #c084fc, #3b82f6)', padding: '1rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BrainCircuit size={32} color="white" />
          </div>
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>RetailVision AI Shopping Assistant</h2>
        <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1.1rem' }}>Looking for something specific? Ask me for recommendations, setups, or deals.</p>
        
        <form onSubmit={handleQuery} style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '1rem' }}>
            <Search size={20} color="#94a3b8" />
          </div>
          <input 
            type="text" 
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g. 'I need a laptop setup for work' or 'Show me mice under 50'"
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', padding: '1rem 0.5rem', outline: 'none', fontSize: '1rem' }}
          />
          <button type="submit" disabled={loading} style={{ background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)', color: 'white', border: 'none', borderRadius: '999px', padding: '0 2rem', fontWeight: 'bold', cursor: 'pointer', transition: 'opacity 0.2s' }}>
            {loading ? 'Thinking...' : 'Ask AI'}
          </button>
        </form>

        {results && (
          <div style={{ marginTop: '2.5rem', textAlign: 'left', background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ color: '#60a5fa', marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BrainCircuit size={20} /> {results.message}
            </h4>
            
            {results.products && results.products.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                {results.products.map(p => (
                  <div key={p._id} style={{ background: 'white', borderRadius: '8px', padding: '1rem', cursor: 'pointer', color: '#0f172a', transition: 'transform 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} onClick={() => navigate(`/products/${p._id}`)}>
                    <h5 style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</h5>
                    <div style={{ color: '#2563eb', fontWeight: 'bold' }}>{formatCurrency(p.price)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;
