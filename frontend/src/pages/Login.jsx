import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Hexagon, Eye, EyeOff } from 'lucide-react';

const Logo = () => (
  <div className="flex items-center justify-center gap-2 text-primary font-bold text-2xl mb-6">
    <Hexagon className="text-secondary" fill="currentColor" strokeWidth={1} size={32} />
    RetailVision<span className="text-muted font-light">_AI</span>
  </div>
);

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'CUSTOMER') {
        navigate('/');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-subtle)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '3rem 2rem', border: '1px solid var(--border)' }}>
        <Logo />
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="text-2xl font-bold mb-2">Welcome back to RetailVision_AI</h1>
          <p className="text-muted">Sign in to continue your intelligent retail experience.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-md text-sm font-medium" style={{ background: 'var(--error-bg)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="you@example.com"
            />
          </div>
          
          <div style={{ position: 'relative' }}>
            <label className="form-label">Password</label>
            <input 
              type={showPassword ? 'text' : 'password'} 
              className="form-input" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ paddingRight: '2.5rem' }}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '0.75rem', top: '2.3rem', background: 'none', border: 'none', color: 'var(--text-muted)' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          <button type="submit" className="btn-primary w-full mt-2" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-muted">Don't have an account? </span>
          <Link to="/register" className="font-semibold text-primary hover:text-secondary">Create one</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
