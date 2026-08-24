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

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError('Registration failed. This email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-subtle)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '3rem 2rem', border: '1px solid var(--border)', margin: '2rem 0' }}>
        <Logo />
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="text-2xl font-bold mb-2">Create your RetailVision_AI account</h1>
          <p className="text-muted">Join a smarter electronics shopping experience.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-md text-sm font-medium" style={{ background: 'var(--error-bg)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              name="name"
              className="form-input" 
              required 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              name="email"
              className="form-input" 
              required 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="you@example.com"
            />
          </div>
          
          <div style={{ position: 'relative' }}>
            <label className="form-label">Password</label>
            <input 
              type={showPassword ? 'text' : 'password'} 
              name="password"
              className="form-input" 
              required 
              value={formData.password} 
              onChange={handleChange}
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

          <div>
            <label className="form-label">Confirm Password</label>
            <input 
              type={showPassword ? 'text' : 'password'} 
              name="confirmPassword"
              className="form-input" 
              required 
              value={formData.confirmPassword} 
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" className="btn-primary w-full mt-2" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-muted">Already have an account? </span>
          <Link to="/login" className="font-semibold text-primary hover:text-secondary">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
