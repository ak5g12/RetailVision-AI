import React, { useState } from 'react';
import { Users, ShoppingBag, CreditCard, Clock, Activity, AlertTriangle, ShieldCheck, ChevronRight, X, TrendingUp, Package } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { formatCurrency } from '../../utils/currency';
import api from '../../services/api';

const Customer360 = ({ customerSegmentsData }) => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [retentionModal, setRetentionModal] = useState(null);
  const [discountInput, setDiscountInput] = useState(0);
  const [applying, setApplying] = useState(false);

  if (!customerSegmentsData) {
    return <p style={{ color: 'var(--text-muted)' }}>Loading customer data...</p>;
  }

  const { status, message, data } = customerSegmentsData;

  const getRiskColor = (level) => {
    if (level === 'High Risk') return '#dc2626'; // red
    if (level === 'Medium Risk') return '#d97706'; // amber
    return '#16a34a'; // green
  };

  return (
    <div>
      {status !== 'success' && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '6px', color: '#b91c1c', marginBottom: '1rem' }}>
          <strong>Note:</strong> {message}
        </div>
      )}
      
      {/* High-level KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Total Customers</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{data?.length || 0}</div>
        </div>
        <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#166534' }}>High Value Segment</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#15803d' }}>
            {data?.filter(c => c.segment === 'High Value').length || 0}
          </div>
        </div>
        <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '6px', border: '1px solid #fecaca' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#991b1b' }}>At Risk</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#b91c1c' }}>
            {data?.filter(c => c.risk_level === 'High Risk').length || 0}
          </div>
        </div>
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Avg Customer Spend</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            { formatCurrency(data?.length > 0 ? (data.reduce((s, c) => s + c.monetary, 0) / data.length) : 0) }
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead style={{ background: '#f9fafb', position: 'sticky', top: 0, zIndex: 1, borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '0.75rem' }}>Customer</th>
              <th style={{ padding: '0.75rem' }}>Segment</th>
              <th style={{ padding: '0.75rem' }}>Total Spend</th>
              <th style={{ padding: '0.75rem' }}>Orders</th>
              <th style={{ padding: '0.75rem' }}>Risk Level</th>
              <th style={{ padding: '0.75rem' }}></th>
            </tr>
          </thead>
          <tbody>
            {data?.map(c => (
              <tr key={c.customer_id} style={{ borderBottom: '1px solid #eee', cursor: 'pointer', transition: 'background 0.2s' }} className="hover-bg-gray" onClick={() => setSelectedCustomer(c)}>
                <td style={{ padding: '0.75rem' }}>
                  <div style={{ fontWeight: 'bold' }}>{c.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email}</div>
                </td>
                <td style={{ padding: '0.75rem', fontWeight: '500' }}>{c.segment || 'Unsegmented'}</td>
                <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#16a34a' }}>{formatCurrency(c.monetary)}</td>
                <td style={{ padding: '0.75rem' }}>{c.frequency}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setRetentionModal(c); 
                      setDiscountInput(c.risk_level === 'High Risk' || c.risk_level === 'At Risk' ? 15 : c.risk_level === 'Medium Risk' ? 10 : 0);
                    }} 
                    style={{ color: getRiskColor(c.risk_level), fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>
                    {c.risk_level}
                  </span>
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                  <button className="btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center' }}>
                    View 360 <ChevronRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {(!data || data.length === 0) && (
              <tr>
                <td colSpan="6" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No active customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Customer 360 Modal Overlay */}
      {selectedCustomer && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: 'white', width: '90%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto',
            borderRadius: '12px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {selectedCustomer.name}
                  <span style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem', background: '#f3f4f6', borderRadius: '999px', color: 'var(--text-muted)' }}>
                    {selectedCustomer.segment || 'Unsegmented'}
                  </span>
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>{selectedCustomer.email} {selectedCustomer.phone ? `• ${selectedCustomer.phone}` : ''}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                <X size={24} color="var(--text-muted)" />
              </button>
            </div>

            {/* 360 KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  <CreditCard size={16} /> Lifetime Spend
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#16a34a' }}>{formatCurrency(selectedCustomer.monetary)}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  <ShoppingBag size={16} /> Total Orders
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{selectedCustomer.frequency}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  <Package size={16} /> Total Items
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{selectedCustomer.total_quantity}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  <TrendingUp size={16} /> Avg Order Value
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{formatCurrency(selectedCustomer.aov)}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              
              {/* Left Column: Channels & Risk */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ border: `1px solid ${getRiskColor(selectedCustomer.risk_level)}`, padding: '1.5rem', borderRadius: '8px', background: selectedCustomer.risk_level === 'High Risk' ? '#fef2f2' : '#f0fdf4' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: getRiskColor(selectedCustomer.risk_level), marginBottom: '0.5rem' }}>
                    {selectedCustomer.risk_level === 'Low Risk' ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />} 
                    {selectedCustomer.risk_level}
                  </h3>
                  <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>{selectedCustomer.risk_reason}</p>
                  <div style={{ background: 'rgba(255,255,255,0.6)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem' }}>
                    <strong>Action:</strong> {selectedCustomer.recommendation}
                  </div>
                </div>

                <div style={{ border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '8px' }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Channel Preference</h3>
                  <div style={{ height: '200px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'POS (In-store)', value: selectedCustomer.pos_orders, color: '#3b82f6' },
                            { name: 'Online', value: selectedCustomer.online_orders, color: '#8b5cf6' }
                          ]}
                          cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                        >
                          <Cell key="cell-0" fill="#3b82f6" />
                          <Cell key="cell-1" fill="#8b5cf6" />
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Last Purchase: {selectedCustomer.last_purchase_date ? new Date(selectedCustomer.last_purchase_date).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Right Column: Products & Transactions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '8px' }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Product Purchase History</h3>
                  {selectedCustomer.product_breakdown ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                      <tbody>
                        {Object.entries(selectedCustomer.product_breakdown).sort((a, b) => b[1] - a[1]).map(([prodName, qty], idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '0.5rem 0', color: 'var(--primary)', fontWeight: '500' }}>{prodName}</td>
                            <td style={{ padding: '0.5rem 0', textAlign: 'right', fontWeight: 'bold' }}>{qty} units</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No product breakdown available.</p>
                  )}
                </div>

                <div style={{ border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '8px' }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Recent Transactions</h3>
                  {selectedCustomer.transactions && selectedCustomer.transactions.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {selectedCustomer.transactions.map((tx, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '6px' }}>
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{tx.orderNumber}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(tx.date).toLocaleDateString()} • {tx.source}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 'bold', color: '#16a34a' }}>{formatCurrency(tx.total)}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.items} items</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No recent transactions found.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    
      {retentionModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Retention Offer</h2>
              <button onClick={() => setRetentionModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <p><strong>Customer Name:</strong> {retentionModal.name}</p>
              <p><strong>Email:</strong> {retentionModal.email}</p>
              <p><strong>Total Spend:</strong> {formatCurrency(retentionModal.monetary)}</p>
              <p><strong>Total Orders:</strong> {retentionModal.frequency}</p>
              <p><strong>Last Purchase Date:</strong> {new Date(retentionModal.last_purchase_date).toLocaleDateString()}</p>
              <p><strong>Days Since Last Purchase:</strong> {retentionModal.recency} days</p>
              <p><strong>Current Risk Level:</strong> <span style={{color: getRiskColor(retentionModal.risk_level)}}>{retentionModal.risk_level}</span></p>
            </div>

            {retentionModal.risk_level !== 'Low Risk' && (
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Recommended Retention Offer</h4>
                <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Recommended Discount: {retentionModal.risk_level === 'High Risk' || retentionModal.risk_level === 'At Risk' ? '15%' : '10%'}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label>Discount: [</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="30" 
                    value={discountInput} 
                    onChange={e => setDiscountInput(Number(e.target.value))} 
                    style={{ width: '60px', padding: '0.25rem', border: '1px solid #ccc', borderRadius: '4px' }} 
                  />
                  <label>] %</label>
                </div>
              </div>
            )}

            {retentionModal.risk_level !== 'Low Risk' ? (
              <button 
                className="btn-primary" 
                style={{ width: '100%', padding: '0.75rem', marginTop: '1rem' }}
                disabled={applying || discountInput <= 0 || discountInput > 30}
                onClick={async () => {
                  setApplying(true);
                  try {
                    await api.post('/coupons', { customerId: retentionModal.customer_id, discountPercentage: discountInput });
                    alert('Discount applied successfully! Customer can use it at checkout.');
                    setRetentionModal(null);
                  } catch (err) {
                    alert(err.response?.data?.message || 'Error creating discount');
                  } finally {
                    setApplying(false);
                  }
                }}
              >
                {applying ? 'Applying...' : 'Apply Discount'}
              </button>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Customer is Low Risk. No retention discount recommended.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default Customer360;

