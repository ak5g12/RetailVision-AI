import React, { useState } from 'react';
import api from '../services/api';
import { UploadCloud, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

const AdminImport = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreview(null);
      setError('');
      setSuccess('');
    }
  };

  const handlePreview = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await api.post('/import/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPreview(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to parse file');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!preview || preview.validCount === 0) return;
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/import/confirm', { data: preview.validDataPayload });
      setSuccess(res.data.message);
      setPreview(null);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Import Historical Sales Data</h1>
      
      <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Upload CSV File</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          File must contain headers: <code>date, sku, quantity, price</code>.
        </p>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input 
            type="file" 
            accept=".csv"
            onChange={handleFileChange}
            style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px', flex: 1 }}
          />
          <button 
            onClick={handlePreview} 
            disabled={!file || loading}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <UploadCloud className="icon-sm" /> Preview
          </button>
        </div>
        {error && <div className="alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
        {success && <div style={{ marginTop: '1rem', padding: '1rem', background: '#dcfce7', color: '#166534', borderRadius: '4px' }}>{success}</div>}
      </div>

      {preview && (
        <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText className="icon-sm"/> Import Preview
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{preview.totalRows}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Rows</div>
            </div>
            <div style={{ padding: '1rem', background: '#ecfdf5', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{preview.validCount}</div>
              <div style={{ color: '#047857', fontSize: '0.875rem' }}>Valid Rows</div>
            </div>
            <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>{preview.invalidCount}</div>
              <div style={{ color: '#b91c1c', fontSize: '0.875rem' }}>Invalid Rows</div>
            </div>
          </div>

          {preview.invalidCount > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#ef4444', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle className="icon-sm"/> Validation Errors (showing top 50)
              </h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto', background: '#fef2f2', padding: '1rem', borderRadius: '6px', border: '1px solid #fecaca' }}>
                {preview.invalidRows.map((err, i) => (
                  <div key={i} style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    <strong>Row {err.rowNumber}:</strong> {err.errors.join(', ')}
                  </div>
                ))}
              </div>
            </div>
          )}

          {preview.validCount > 0 && (
            <div>
              <h4 style={{ marginBottom: '1rem' }}>Sample Valid Records</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '2rem', fontSize: '0.875rem' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
                  <tr>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quantity</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.sampleValid.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem' }}>{new Date(r.date).toLocaleDateString()}</td>
                      <td style={{ padding: '0.75rem' }}>{r.quantity}</td>
                      <td style={{ padding: '0.75rem' }}>{formatCurrency(r.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <button 
                onClick={handleConfirmImport} 
                disabled={loading}
                className="btn-primary w-full"
                style={{ padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                <CheckCircle className="icon-sm"/> Confirm & Import {preview.validCount} Records
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminImport;
