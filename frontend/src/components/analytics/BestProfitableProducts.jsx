import React from 'react';
import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

const BestProfitableProducts = ({ products }) => {
  if (!products || products.length === 0) {
    return <p style={{ color: 'var(--text-muted)' }}>No profitable product data available.</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
        <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
          <tr>
            <th style={{ padding: '0.75rem 1rem' }}>Product</th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Units Sold</th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Revenue</th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Cost</th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Gross Profit</th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Margin</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, index) => (
            <tr key={p._id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '0.75rem 1rem', fontWeight: '500', color: 'var(--primary)' }}>
                {index + 1}. {p.name}
              </td>
              <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>{p.totalSold}</td>
              <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>{formatCurrency(p.revenue)}</td>
              <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'var(--text-muted)' }}>
                {p.totalCost != null ? `${formatCurrency(p.totalCost)}` : 'N/A'}
              </td>
              <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 'bold', color: p.grossProfit != null ? '#16a34a' : 'var(--text-muted)' }}>
                {p.grossProfit != null ? `${formatCurrency(p.grossProfit)}` : 'N/A'}
              </td>
              <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                <span style={{ 
                  background: p.profitMargin != null ? '#dcfce7' : '#f1f5f9', 
                  color: p.profitMargin != null ? '#16a34a' : 'var(--text-muted)', 
                  padding: '0.2rem 0.5rem', 
                  borderRadius: '4px', 
                  fontWeight: '600' 
                }}>
                  {p.profitMargin != null ? `${Number(p.profitMargin).toFixed(2)}%` : 'N/A'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BestProfitableProducts;
