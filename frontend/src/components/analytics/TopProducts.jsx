import React from 'react';
import { formatCurrency } from '../../utils/currency';

const TopProducts = ({ topProducts }) => {
  if (!topProducts || topProducts.length === 0) {
    return <p style={{ color: 'var(--text-muted)' }}>No data available.</p>;
  }

  // Find max for scaling the progress bar
  const maxSold = Math.max(...topProducts.map(p => p.totalSold));

  return (
    <div style={{ height: '300px', overflowY: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
        <thead style={{ background: '#f9fafb', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 1 }}>
          <tr>
            <th style={{ padding: '0.75rem' }}>Product</th>
            <th style={{ padding: '0.75rem' }}>Units Sold</th>
            <th style={{ padding: '0.75rem' }}>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {topProducts.slice(0, 5).map(item => (
            <tr key={item._id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '0.75rem', fontWeight: '500' }}>{item.name}</td>
              <td style={{ padding: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ minWidth: '20px' }}>{item.totalSold}</span>
                  <div style={{ flex: 1, background: '#e5e7eb', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${(item.totalSold / maxSold) * 100}%`, 
                        background: '#10b981' 
                      }} 
                    />
                  </div>
                </div>
              </td>
              <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                {item.revenue ? formatCurrency(item.revenue) : formatCurrency(0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopProducts;
