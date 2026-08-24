import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, Activity, Package, Users, 
  TrendingUp, AlertTriangle, LineChart, Cpu, ShoppingBag, Database, ArrowRight,
  BrainCircuit, BarChart2, PieChart, ShieldAlert, Hexagon
} from 'lucide-react';
import api from '../services/api';
import ProductImage from '../components/ProductImage';
import AIAssistant from '../components/AIAssistant';
import RecommendedProducts from '../components/RecommendedProducts';
import SmartOffers from '../components/SmartOffers';
import { formatCurrency } from '../utils/currency';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await api.get('/products?sort=latest');
        const data = prodRes.data.products || prodRes.data;
        setFeaturedProducts(Array.isArray(data) ? data.slice(0, 8) : []);
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddToCart = async (product) => {
    setAdding(prev => ({ ...prev, [product._id]: true }));
    try {
      await api.post('/cart', { productId: product._id, quantity: 1 });
      alert(`Added ${product.name} to cart!`);
    } catch (err) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        alert(err.response?.data?.message || 'Failed to add item to cart');
      }
    } finally {
      setAdding(prev => ({ ...prev, [product._id]: false }));
    }
  };

  const skeletonArray = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="home-page" style={{ overflowX: 'hidden' }}>
      <style>{`
        /* Hero Base */
        .hero-bg {
          background-color: #020617;
          background-image: 
            radial-gradient(circle at 15% 50%, rgba(59, 130, 246, 0.15), transparent 25%),
            radial-gradient(circle at 85% 30%, rgba(168, 85, 247, 0.15), transparent 25%),
            radial-gradient(circle at 50% 100%, rgba(6, 182, 212, 0.1), transparent 40%);
          position: relative;
        }
        
        .hero-pattern {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 30px 30px;
          opacity: 0.5;
          z-index: 1;
          pointer-events: none;
        }

        /* Typography */
        .main-title-gradient {
          background: linear-gradient(to right, #60a5fa, #c084fc, #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: #fff; /* Fallback */
        }

        /* Hero Buttons */
        .btn-hero-primary {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: white;
          border: none;
          box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.39);
          transition: all 0.3s ease;
          position: relative;
          z-index: 20;
          cursor: pointer;
        }
        .btn-hero-primary:hover {
          background: linear-gradient(135deg, #3b82f6, #60a5fa);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
        }
        
        .btn-hero-secondary {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          color: white;
          border: 1px solid rgba(168, 85, 247, 0.4);
          transition: all 0.3s ease;
          position: relative;
          z-index: 20;
          cursor: pointer;
        }
        .btn-hero-secondary:hover {
          background: rgba(168, 85, 247, 0.1);
          border-color: rgba(168, 85, 247, 0.8);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(168, 85, 247, 0.2);
        }

        /* Laptop Visual */
        .laptop-wrapper {
          position: relative;
          z-index: 5;
          width: 100%;
          max-width: 650px;
          margin: 0 auto;
          filter: drop-shadow(0 20px 40px rgba(0,0,0,0.5));
          pointer-events: none; /* Prevent blocking clicks */
        }
        .laptop-glow {
          position: absolute;
          inset: -20px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(168, 85, 247, 0.1) 50%, transparent 70%);
          z-index: -1;
          border-radius: 50%;
          pointer-events: none;
        }
        .laptop-lid {
          background: #0f172a;
          border-radius: 16px 16px 0 0;
          padding: 10px;
          border: 2px solid #334155;
          border-bottom: none;
          box-shadow: inset 0 0 20px rgba(255,255,255,0.05);
          position: relative;
        }
        .laptop-glass {
          background: #020617;
          border-radius: 8px 8px 0 0;
          border: 1px solid #1e293b;
          overflow: hidden;
          aspect-ratio: 16/10;
          position: relative;
        }
        .laptop-base {
          height: 18px;
          background: linear-gradient(to bottom, #cbd5e1, #94a3b8);
          border-radius: 0 0 24px 24px;
          width: 114%;
          margin-left: -7%;
          position: relative;
          box-shadow: inset 0 2px 4px rgba(255,255,255,0.5), 0 10px 20px rgba(0,0,0,0.5);
        }
        .laptop-notch {
          width: 15%;
          height: 6px;
          background: #64748b;
          margin: 0 auto;
          border-radius: 0 0 4px 4px;
        }

        /* Dashboard Inside Laptop */
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          grid-template-rows: auto 1fr 1fr;
          gap: 0.5rem;
          padding: 0.75rem;
          height: 100%;
          background: #0f172a;
        }
        .dash-card {
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(51, 65, 85, 0.5);
          border-radius: 6px;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        .dash-title {
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          margin-bottom: 0.25rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        
        /* Feature Cards (AI Section) */
        .feature-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 2rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          z-index: 1;
        }
        .feature-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent, transparent);
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
          border-color: transparent;
        }
        .feature-card:hover::before {
          opacity: 1;
        }
        
        /* Accent Specific Hovers */
        .card-blue:hover { border: 1px solid #bfdbfe; box-shadow: 0 20px 40px -10px rgba(59, 130, 246, 0.15); }
        .card-blue:hover::before { background: linear-gradient(135deg, rgba(239, 246, 255, 0.5), rgba(219, 234, 254, 0.2)); }
        
        .card-purple:hover { border: 1px solid #e9d5ff; box-shadow: 0 20px 40px -10px rgba(168, 85, 247, 0.15); }
        .card-purple:hover::before { background: linear-gradient(135deg, rgba(250, 245, 255, 0.5), rgba(243, 232, 255, 0.2)); }
        
        .card-cyan:hover { border: 1px solid #a5f3fc; box-shadow: 0 20px 40px -10px rgba(6, 182, 212, 0.15); }
        .card-cyan:hover::before { background: linear-gradient(135deg, rgba(236, 254, 255, 0.5), rgba(207, 250, 254, 0.2)); }
        
        .card-green:hover { border: 1px solid #a7f3d0; box-shadow: 0 20px 40px -10px rgba(16, 185, 129, 0.15); }
        .card-green:hover::before { background: linear-gradient(135deg, rgba(236, 253, 245, 0.5), rgba(209, 250, 229, 0.2)); }
        
        .card-pink:hover { border: 1px solid #fbcfe8; box-shadow: 0 20px 40px -10px rgba(236, 72, 153, 0.15); }
        .card-pink:hover::before { background: linear-gradient(135deg, rgba(253, 242, 248, 0.5), rgba(252, 231, 243, 0.2)); }
        
        .card-orange:hover { border: 1px solid #fde68a; box-shadow: 0 20px 40px -10px rgba(245, 158, 11, 0.15); }
        .card-orange:hover::before { background: linear-gradient(135deg, rgba(255, 251, 235, 0.5), rgba(254, 243, 199, 0.2)); }

        .feature-icon-wrapper {
          transition: transform 0.3s ease;
        }
        .feature-card:hover .feature-icon-wrapper {
          transform: scale(1.1);
        }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
          .hero-content-wrapper { flex-direction: column; text-align: center; }
          .laptop-wrapper { margin-top: 3rem; }
          .hero-btns { justify-content: center; }
          .dashboard-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      {/* 1. HERO SECTION */}
      <section className="hero-bg text-white" style={{ padding: '6rem 2rem 8rem 2rem' }}>
        <div className="hero-pattern"></div>
        
        <div className="container relative z-10" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div className="hero-content-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
            
            {/* Left Content */}
            <div style={{ flex: '1 1 50%', position: 'relative', zIndex: 20 }}>
              <div className="inline-block px-4 py-1.5 rounded-full mb-6 text-xs font-bold uppercase tracking-wider" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                AI-Powered • Smart • Intelligent
              </div>
              
              <h1 className="mb-4" style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1.2, letterSpacing: '-1px' }}>
                <span className="main-title-gradient" style={{ display: 'block' }}>RetailVision_AI:</span>
                <span className="main-title-gradient" style={{ display: 'block' }}>Intelligent Retail Management</span>
              </h1>
              
              <h2 className="text-2xl font-semibold mb-6" style={{ color: '#f8fafc', letterSpacing: '-0.5px' }}>
                Experience the Future of Intelligent Electronics
              </h2>
              
              <p className="text-lg mb-8" style={{ color: '#94a3b8', lineHeight: 1.6, maxWidth: '90%' }}>
                Shop smarter with AI-powered recommendations, real-time inventory intelligence and intelligent retail analytics — all in one connected platform.
              </p>
              
              <div className="hero-btns" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', position: 'relative', zIndex: 30 }}>
                <Link to="/products" className="btn-hero-primary px-8 py-3.5 rounded-lg font-semibold text-lg flex items-center gap-2">
                  Explore Products <ArrowRight size={20} />
                </Link>
                <a href="#ai-features" className="btn-hero-secondary px-8 py-3.5 rounded-lg font-semibold text-lg">
                  Discover AI Features
                </a>
              </div>
            </div>

            {/* Right Content - Premium Laptop */}
            <div style={{ flex: '1 1 50%', display: 'flex', justifyContent: 'center' }}>
              <div className="laptop-wrapper">
                <div className="laptop-glow"></div>
                <div className="laptop-lid">
                  <div className="laptop-glass">
                    
                    {/* Power BI Style Dashboard Inside Laptop */}
                    <div className="dashboard-grid">
                      {/* Header */}
                      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f8fafc', fontWeight: '600', fontSize: '0.8rem' }}>
                          <Hexagon size={16} color="#60a5fa" /> Retail Analytics Center
                        </div>
                        <div style={{ fontSize: '0.6rem', color: '#64748b', fontStyle: 'italic' }}>*Visual Representation</div>
                      </div>

                      {/* Card: Sales Trend */}
                      <div className="dash-card">
                        <div className="dash-title"><TrendingUp size={12} color="#f472b6"/> Sales Analytics</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4px' }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f8fafc' }}>₹24.5k</span>
                          <span style={{ fontSize: '0.6rem', color: '#34d399', background: 'rgba(52,211,153,0.1)', padding: '2px 4px', borderRadius: '4px' }}>+12%</span>
                        </div>
                        <div style={{ flex: 1, position: 'relative', marginTop: 'auto' }}>
                          <svg viewBox="0 0 100 30" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                            <path d="M0,25 Q15,25 25,15 T50,20 T75,5 T100,10" fill="none" stroke="#f472b6" strokeWidth="2.5" strokeLinecap="round" />
                            <path d="M0,25 Q15,25 25,15 T50,20 T75,5 T100,10 L100,30 L0,30 Z" fill="url(#pinkGrad)" opacity="0.3" />
                            <defs>
                              <linearGradient id="pinkGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f472b6"/><stop offset="100%" stopColor="transparent"/></linearGradient>
                            </defs>
                          </svg>
                        </div>
                      </div>

                      {/* Card: AI Demand Forecast */}
                      <div className="dash-card" style={{ gridColumn: 'span 2' }}>
                        <div className="dash-title"><BrainCircuit size={12} color="#a855f7"/> AI Demand Forecast (Next 7 Days)</div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', height: '100%', paddingTop: '0.25rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '30px' }}>
                            <div style={{ fontSize: '0.5rem', color: '#64748b' }}>High</div>
                            <div style={{ fontSize: '0.5rem', color: '#64748b', marginTop: 'auto' }}>Low</div>
                          </div>
                          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '8%', height: '100%' }}>
                            <div style={{ width: '10%', height: '40%', background: '#3b82f6', borderRadius: '2px 2px 0 0' }}></div>
                            <div style={{ width: '10%', height: '60%', background: '#3b82f6', borderRadius: '2px 2px 0 0' }}></div>
                            <div style={{ width: '10%', height: '50%', background: '#3b82f6', borderRadius: '2px 2px 0 0' }}></div>
                            <div style={{ width: '10%', height: '70%', background: '#a855f7', borderRadius: '2px 2px 0 0', position: 'relative' }}>
                              <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: '#a855f7', color: 'white', fontSize: '0.5rem', padding: '1px 4px', borderRadius: '4px' }}>AI</div>
                            </div>
                            <div style={{ width: '10%', height: '90%', background: '#a855f7', borderRadius: '2px 2px 0 0', opacity: 0.7 }}></div>
                            <div style={{ width: '10%', height: '80%', background: '#a855f7', borderRadius: '2px 2px 0 0', opacity: 0.5 }}></div>
                          </div>
                        </div>
                      </div>

                      {/* Card: Product Performance */}
                      <div className="dash-card">
                        <div className="dash-title"><BarChart2 size={12} color="#34d399"/> Top Products</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', justifyContent: 'center', flex: 1 }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.5rem', color: '#cbd5e1', marginBottom: '2px' }}><span>Gaming Laptop</span><span>450 units</span></div>
                            <div style={{ width: '100%', height: '4px', background: '#1e293b', borderRadius: '2px' }}><div style={{ width: '85%', height: '100%', background: '#34d399', borderRadius: '2px' }}></div></div>
                          </div>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.5rem', color: '#cbd5e1', marginBottom: '2px' }}><span>Wireless Earbuds</span><span>320 units</span></div>
                            <div style={{ width: '100%', height: '4px', background: '#1e293b', borderRadius: '2px' }}><div style={{ width: '60%', height: '100%', background: '#38bdf8', borderRadius: '2px' }}></div></div>
                          </div>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.5rem', color: '#cbd5e1', marginBottom: '2px' }}><span>Smart Watch</span><span>210 units</span></div>
                            <div style={{ width: '100%', height: '4px', background: '#1e293b', borderRadius: '2px' }}><div style={{ width: '40%', height: '100%', background: '#fbbf24', borderRadius: '2px' }}></div></div>
                          </div>
                        </div>
                      </div>

                      {/* Card: Inventory Intelligence */}
                      <div className="dash-card">
                        <div className="dash-title"><Package size={12} color="#fbbf24"/> Inventory Health</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '1rem' }}>
                           <div style={{ position: 'relative', width: '40px', height: '40px' }}>
                             <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                               <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1e293b" strokeWidth="3" />
                               <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#fbbf24" strokeWidth="3" strokeDasharray="80, 100" />
                             </svg>
                             <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold', color: '#f8fafc' }}>80%</div>
                           </div>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                             <div style={{ fontSize: '0.55rem', color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '2px 4px', borderRadius: '3px', border: '1px solid rgba(239,68,68,0.3)' }}>2 Items Low</div>
                             <div style={{ fontSize: '0.55rem', color: '#94a3b8' }}>145 Healthy</div>
                           </div>
                        </div>
                      </div>

                      {/* Card: Customer / Anomaly */}
                      <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ flex: 1, background: 'rgba(236,72,153,0.05)', border: '1px solid rgba(236,72,153,0.2)', borderRadius: '4px', padding: '0.4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                           <div className="dash-title" style={{ marginBottom: '2px' }}><ShieldAlert size={10} color="#f43f5e"/> Anomaly Monitor</div>
                           <div style={{ fontSize: '0.6rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                             <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 4px #10b981' }}></span> All Systems Normal
                           </div>
                        </div>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.25rem' }}>
                           <div style={{ fontSize: '0.55rem', color: '#94a3b8' }}><Users size={10} className="inline mr-1"/> Segmentation</div>
                           <div style={{ display: 'flex', gap: '2px' }}>
                             <div style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '1px' }}></div>
                             <div style={{ width: '8px', height: '8px', background: '#a855f7', borderRadius: '1px' }}></div>
                             <div style={{ width: '8px', height: '8px', background: '#f472b6', borderRadius: '1px' }}></div>
                           </div>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                </div>
                <div className="laptop-base"><div className="laptop-notch"></div></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. CUSTOMER AI SECTIONS */}
      <section className="container px-6" style={{ maxWidth: '1200px', margin: '4rem auto 0 auto' }}>
        <AIAssistant />
        <RecommendedProducts addToCart={handleAddToCart} adding={adding} />
        <SmartOffers />
      </section>

      {/* 2. AI / ML FEATURE CARDS */}
      <section id="ai-features" style={{ background: '#f8fafc', padding: '6rem 2rem' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#0f172a', letterSpacing: '-0.5px' }}>Intelligent Retail, Built In</h2>
            <p className="text-muted max-w-2xl mx-auto text-lg">
              Behind every purchase, RetailVision_AI combines intelligent shopping with powerful retail analytics.
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            
            <div className="feature-card card-blue">
              <div className="feature-icon-wrapper" style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid #bfdbfe' }}>
                <BrainCircuit size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Smart Recommendations</h3>
              <p className="text-slate-500 leading-relaxed">Smart product suggestions designed to make shopping easier and more personalized for every customer.</p>
            </div>
            
            <div className="feature-card card-purple">
              <div className="feature-icon-wrapper" style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid #e9d5ff' }}>
                <LineChart size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Demand Forecasting</h3>
              <p className="text-slate-500 leading-relaxed">Predict future product demand using historical sales patterns to optimize purchasing decisions.</p>
            </div>
            
            <div className="feature-card card-orange">
              <div className="feature-icon-wrapper" style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid #fde68a' }}>
                <Package size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Real-Time Inventory</h3>
              <p className="text-slate-500 leading-relaxed">Monitor stock levels intelligently and identify products approaching stock-out before they impact revenue.</p>
            </div>

            <div className="feature-card card-cyan">
              <div className="feature-icon-wrapper" style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#ecfeff', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid #a5f3fc' }}>
                <Users size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Customer Intelligence</h3>
              <p className="text-slate-500 leading-relaxed">Understand real customer purchasing behavior, buying patterns, and segment audiences effortlessly.</p>
            </div>
            
            <div className="feature-card card-pink">
              <div className="feature-icon-wrapper" style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#fdf2f8', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid #fbcfe8' }}>
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Sales Anomaly Detection</h3>
              <p className="text-slate-500 leading-relaxed">Automatically identify unusual sales patterns or irregular data points that may require immediate attention.</p>
            </div>
            
            <div className="feature-card card-green">
              <div className="feature-icon-wrapper" style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid #a7f3d0' }}>
                <BarChart2 size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Real-Time Analytics</h3>
              <p className="text-slate-500 leading-relaxed">Turn sales and inventory activity into actionable business insights from a central command dashboard.</p>
            </div>
          </div>
        </div>
      </section>


      {/* 3. SHOPPING SECTION */}
      <section className="container px-6" style={{ maxWidth: '1200px', margin: '6rem auto', paddingBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
          <div>
            <h2 className="text-3xl font-bold mb-2 text-slate-900">Explore Our Electronics</h2>
            <p className="text-slate-500">Premium technology ready for purchase.</p>
          </div>
          <Link to="/products" style={{ color: '#3b82f6', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}>
            View all products <ArrowRight size={18} />
          </Link>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
          {loading ? (
            skeletonArray.map(i => (
              <div key={i} className="card p-4 flex flex-col gap-4" style={{ border: '1px solid var(--border)', borderRadius: '16px', padding: '1rem', background: '#fff' }}>
                <div className="skeleton" style={{ height: '200px', width: '100%', borderRadius: '8px' }}></div>
                <div className="skeleton" style={{ height: '24px', width: '70%', borderRadius: '4px' }}></div>
                <div className="skeleton" style={{ height: '40px', width: '100%', marginTop: 'auto', borderRadius: '8px' }}></div>
              </div>
            ))
          ) : featuredProducts.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
              No products available in the catalog right now.
            </div>
          ) : (
            featuredProducts.map(p => (
              <div key={p._id} className="card" style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', borderRadius: '16px', background: '#fff', overflow: 'hidden', transition: 'transform 0.2s ease, box-shadow 0.2s ease', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <Link to={`/products/${p._id}`} style={{ display: 'block', position: 'relative', height: '220px', padding: '1.5rem', background: '#fff' }}>
                  <ProductImage 
                    src={p.images && p.images.length > 0 ? p.images[0] : null} 
                    alt={p.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                  />
                  {p.stock <= 5 && p.stock > 0 && (
                    <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#fef3c7', color: '#d97706', padding: '0.25rem 0.6rem', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '999px', border: '1px solid #fde68a' }}>Low Stock</span>
                  )}
                  {p.stock === 0 && (
                    <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#fee2e2', color: '#dc2626', padding: '0.25rem 0.6rem', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '999px', border: '1px solid #fca5a5' }}>Out of Stock</span>
                  )}
                </Link>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.4rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.brand || 'Premium Brand'}</div>
                  <h3 style={{ fontWeight: '600', fontSize: '1.05rem', marginBottom: '0.5rem', color: '#0f172a', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                    <Link to={`/products/${p._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>{p.name}</Link>
                  </h3>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.5rem', marginTop: 'auto' }}>{formatCurrency(p.price)}</div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/products/${p._id}`} className="btn-outline" style={{ flex: 1, textAlign: 'center', padding: '0.6rem', fontSize: '0.875rem', border: '1px solid #cbd5e1', borderRadius: '8px', textDecoration: 'none', color: '#334155', fontWeight: '600', background: 'white' }}>
                      Details
                    </Link>
                    <button 
                      onClick={() => handleAddToCart(p)}
                      disabled={p.stock === 0 || adding[p._id]}
                      style={{ 
                        flex: 1.5, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '0.3rem', 
                        padding: '0.6rem', 
                        fontSize: '0.875rem', 
                        background: (p.stock === 0 || adding[p._id]) ? '#cbd5e1' : '#2563eb', 
                        color: (p.stock === 0 || adding[p._id]) ? '#f8fafc' : 'white', 
                        border: 'none', 
                        borderRadius: '8px', 
                        fontWeight: '600',
                        cursor: (p.stock === 0 || adding[p._id]) ? 'not-allowed' : 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => { if (p.stock !== 0 && !adding[p._id]) e.currentTarget.style.background = '#1d4ed8'; }}
                      onMouseOut={(e) => { if (p.stock !== 0 && !adding[p._id]) e.currentTarget.style.background = '#2563eb'; }}
                    >
                      <ShoppingBag size={16} /> {adding[p._id] ? 'Adding...' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 4. VALUE PROPOSITION */}
      <section style={{ background: '#0f172a', padding: '5rem 2rem', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.05, backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className="container relative z-10" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">More Than Just an Online Store</h2>
            <p style={{ color: '#94a3b8', maxWidth: '700px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.6 }}>
              RetailVision_AI connects the customer shopping experience with intelligent retail management, helping businesses understand sales, inventory and customer behavior from one platform.
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', marginBottom: '1.25rem' }}>
                <ShoppingCart size={28} />
              </div>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.75rem' }}>Smart Shopping</h3>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5 }}>A seamless, fast, and personalized frontend experience for electronics consumers.</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', marginBottom: '1.25rem' }}>
                <Activity size={28} />
              </div>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.75rem' }}>Real-Time Insights</h3>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5 }}>Live operational updates across POS, online orders, and global inventory.</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', marginBottom: '1.25rem' }}>
                <Database size={28} />
              </div>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.75rem' }}>Intelligent Inventory</h3>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5 }}>Protect against stock-outs and instantly identify dead stock anomalies.</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', marginBottom: '1.25rem' }}>
                <PieChart size={28} />
              </div>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.75rem' }}>Data-Driven Decisions</h3>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5 }}>Leverage AI models on historical data to securely predict future retail trends.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
