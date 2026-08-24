import React, { useState } from 'react';
import { Info, AlertTriangle, TrendingDown, Package, Activity, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

const StockOutRisk = ({ stockOutRisk }) => {
  const [expandedId, setExpandedId] = useState(null);

  if (!stockOutRisk || stockOutRisk.length === 0) {
    return <p style={{ color: 'var(--text-muted)' }}>No stock data available.</p>;
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'CRITICAL': return { bg: '#fef2f2', text: '#ef4444', border: '#fecaca' };
      case 'HIGH': return { bg: '#fff7ed', text: '#f97316', border: '#fed7aa' };
      case 'MEDIUM': return { bg: '#fefce8', text: '#eab308', border: '#fef08a' };
      case 'LOW': return { bg: '#f0fdf4', text: '#10b981', border: '#bbf7d0' };
      default: return { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' };
    }
  };

  return (
    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
        <thead style={{ background: '#f9fafb', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 1 }}>
          <tr>
            <th style={{ padding: '0.75rem' }}>Product</th>
            <th style={{ padding: '0.75rem', textAlign: 'right' }}>Opening Stock</th>
            <th style={{ padding: '0.75rem', textAlign: 'right' }}>Units Sold</th>
            <th style={{ padding: '0.75rem', textAlign: 'right' }}>Current Stock</th>
            <th style={{ padding: '0.75rem', textAlign: 'right' }}>Avg Daily Demand</th>
            <th style={{ padding: '0.75rem', textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                Est. Days Until Stock-Out
                <div className="tooltip-container" title="Est. Days Until Stock-Out = Current Stock / Average Daily Demand.">
                  <Info size={14} color="var(--text-muted)" style={{ cursor: 'help' }} />
                </div>
              </div>
            </th>
            <th style={{ padding: '0.75rem', textAlign: 'center' }}>Risk Level</th>
          </tr>
        </thead>
        <tbody>
          {stockOutRisk.map(item => {
            const isExpanded = expandedId === item._id;
            const colors = getRiskColor(item.riskLevel);
            const openingStock = item.stock + (item.soldLast30 || 0);

            return (
              <React.Fragment key={item._id}>
                <tr 
                  onClick={() => toggleExpand(item._id)}
                  style={{ 
                    borderBottom: isExpanded ? 'none' : '1px solid #eee',
                    cursor: 'pointer',
                    background: isExpanded ? '#f8fafc' : 'white',
                    transition: 'background 0.2s'
                  }}
                  className="hover-bg-gray"
                >
                  <td style={{ padding: '0.75rem', fontWeight: '500', color: 'var(--primary)' }}>{item.name}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-muted)' }}>{openingStock}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '500' }}>{item.soldLast30 || 0}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>{item.stock}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    {item.avgDailyDemand > 0 ? item.avgDailyDemand.toFixed(1) : 'Insufficient Data'}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>
                    {item.daysRemaining !== null && item.daysRemaining >= 0 ? item.daysRemaining.toFixed(1) : 'Insufficient Data'}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      background: colors.bg,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                      fontSize: '0.75rem'
                    }}>
                      {item.riskLevel}
                    </span>
                  </td>
                </tr>
                {isExpanded && (
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #eee' }}>
                    <td colSpan="7" style={{ padding: '1rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: 'white', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div>
                          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                            <Activity size={16} /> Sales Trend (30 Days)
                          </h4>
                          <p><strong>{item.soldLast30 || 0}</strong> units sold recently.</p>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            Averaging {item.avgDailyDemand > 0 ? item.avgDailyDemand.toFixed(1) : '0'} units per day.
                          </p>
                        </div>
                        <div>
                          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                            <Package size={16} /> Inventory Status
                          </h4>
                          <p><strong>{item.stock}</strong> units currently on hand.</p>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            {item.daysRemaining !== null && item.daysRemaining >= 0 
                              ? `Estimated to deplete in {formatCurrency(item.daysRemaining)} days.` 
                              : 'Cannot estimate depletion date due to lack of sales.'}
                          </p>
                        </div>
                        <div style={{ background: colors.bg, padding: '1rem', borderRadius: '6px', border: `1px solid ${colors.border}` }}>
                          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: colors.text }}>
                            <AlertCircle size={16} /> Action Required
                          </h4>
                          <p style={{ fontWeight: '500', color: colors.text }}>{item.recommendedAction}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StockOutRisk;
