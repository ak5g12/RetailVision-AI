import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Shield, UserX, UserCheck, Plus, Check } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'STAFF' });
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      setModalError('');
      const { data } = await api.post('/users', newUser);
      setUsers([data, ...users]);
      setIsModalOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'STAFF' });
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    try {
      const { data } = await api.put(`/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: data.role } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      const { data } = await api.put(`/users/${userId}/status`);
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: data.isActive } : u));
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} user`);
    }
  };

  if (loading) return <div className="loading">Loading Users...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1><Users className="icon" style={{ display: 'inline', marginRight: '0.5rem' }}/> Users & Roles</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage system access and roles across the organization.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus className="icon-sm" /> Add User
        </button>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div style={{ background: 'var(--card-bg)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>Name</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>Email</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>Role</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: '500' }}>{u.name}</td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{u.email}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <select 
                    value={u.role} 
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    disabled={u.role === 'ADMIN'}
                    style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '6px', 
                      border: '1px solid var(--border)',
                      background: u.role === 'ADMIN' ? '#f1f5f9' : '#fff',
                      fontWeight: '500',
                      cursor: u.role === 'ADMIN' ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <option value="CUSTOMER">CUSTOMER</option>
                    <option value="STAFF">STAFF</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="OWNER">OWNER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  {u.isActive ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: '#f0fdf4', color: '#16a34a', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      <UserCheck size={14} /> Active
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: '#fef2f2', color: '#dc2626', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      <UserX size={14} /> Deactivated
                    </span>
                  )}
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <button 
                    onClick={() => handleToggleStatus(u._id, u.isActive)}
                    disabled={u.role === 'ADMIN'}
                    className={`btn-outline ${u.role === 'ADMIN' ? 'disabled' : ''}`}
                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                  >
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No users found in the system.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Shield className="icon" /> Create System User</h2>
            
            {modalError && <div className="alert-error" style={{ marginBottom: '1rem' }}>{modalError}</div>}
            
            <form onSubmit={handleCreateUser}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Full Name</label>
                <input type="text" required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email Address</label>
                <input type="email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Password</label>
                <input type="password" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>System Role</label>
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <option value="STAFF">STAFF</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="OWNER">OWNER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline" style={{ border: 'none' }}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
