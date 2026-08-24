import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line 
} from 'recharts';
import { TrendingUp, Package, DollarSign, ShoppingCart, RefreshCw, AlertTriangle, Zap, Users, Activity } from 'lucide-react';
import TopProducts from '../components/analytics/TopProducts';
import StockOutRisk from '../components/analytics/StockOutRisk';
import Customer360 from '../components/analytics/Customer360';
import BestProfitableProducts from '../components/analytics/BestProfitableProducts';
import { formatCurrency } from '../utils/currency';

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [salesTrends, setSalesTrends] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [bestProfitableProducts, setBestProfitableProducts] = useState([]);
  const [stockOutRisk, setStockOutRisk] = useState([]);
  const [customerSegmentsData, setCustomerSegmentsData] = useState(null);
  const [salesAnomalies, setSalesAnomalies] = useState(null);
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ML State
  const [mlStatus, setMlStatus] = useState('');
  const [mlMetrics, setMlMetrics] = useState(null);
  const [training, setTraining] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState(null);
  
  // Forecast inputs
  const [forecastInput, setForecastInput] = useState({
    productId: '', targetDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryRes, trendsRes, topRes, profitRes, riskRes, segRes, anomalyRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/analytics/sales-trends'),
        api.get('/analytics/top-products'),
        api.get('/analytics/best-profitable-products'),
        api.get('/analytics/stock-out-risk'),
        api.get('/analytics/customer-segments'),
        api.get('/analytics/sales-anomalies')
      ]);
      setSummary(summaryRes.data);
      setSalesTrends(trendsRes.data);
      setTopProducts(topRes.data);
      setBestProfitableProducts(profitRes.data);
      setStockOutRisk(riskRes.data);
      // New Customer Intelligence Payload
      setCustomerSegmentsData(segRes.data);
      setSalesAnomalies(anomalyRes.data);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTrainModel = async () => {
    setTraining(true);
    setMlStatus('Training model... This may take a moment.');
    try {
      const res = await api.post('/analytics/ml/train');
      setMlMetrics(res.data.metrics);
      setMlStatus('Model trained successfully!');
    } catch (err) {
      setMlStatus(err.response?.data?.message || 'Training failed. Environment limitation or missing dependencies.');
    } finally {
      setTraining(false);
    }
  };

  const handlePredict = async () => {
    setPredicting(true);
    setPrediction(null);
    try {
      const res = await api.post('/analytics/ml/predict', forecastInput);
      setPrediction(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Prediction failed. Is the model trained?');
    } finally {
      setPredicting(false);
    }
  };

  if (loading) return <div className="loading">Loading Dashboard...</div>;
  if (error) return <div className="alert-error">{error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Admin Dashboard</h1>
        <button onClick={fetchDashboardData} className="btn-outline"><RefreshCw className="icon-sm"/> Refresh</button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: '500' }}>Total Revenue</span>
            <DollarSign className="icon-sm" style={{ color: 'var(--primary)' }} />
          </div>
          <h2 style={{ fontSize: '2rem', marginTop: '0.5rem', letterSpacing: '-0.5px' }}>{formatCurrency(summary?.totalRevenue || 0)}</h2>
        </div>
        <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: '500' }}>Total Orders</span>
            <ShoppingCart className="icon-sm" style={{ color: 'var(--primary)' }} />
          </div>
          <h2 style={{ fontSize: '2rem', marginTop: '0.5rem', letterSpacing: '-0.5px' }}>{summary?.totalOrders || 0}</h2>
        </div>
        <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: '500' }}>Total Cost</span>
            <DollarSign className="icon-sm" style={{ color: '#ef4444' }} />
          </div>
          <h2 style={{ fontSize: '2rem', marginTop: '0.5rem', letterSpacing: '-0.5px' }}>{formatCurrency(summary?.totalCost || 0)}</h2>
        </div>
        <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: '500' }}>Gross Profit</span>
            <DollarSign className="icon-sm" style={{ color: 'var(--primary)' }} />
          </div>
          <h2 style={{ fontSize: '2rem', marginTop: '0.5rem', letterSpacing: '-0.5px' }}>{formatCurrency(summary?.totalGrossProfit || 0)}</h2>
        </div>
        <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: '500' }}>Profit Margin</span>
            <Activity className="icon-sm" style={{ color: 'var(--primary)' }} />
          </div>
          <h2 style={{ fontSize: '2rem', marginTop: '0.5rem', letterSpacing: '-0.5px' }}>{summary?.profitMargin?.toFixed(1) || 0}%</h2>
        </div>
        <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: '500' }}>Units Sold</span>
            <Package className="icon-sm" style={{ color: 'var(--primary)' }} />
          </div>
          <h2 style={{ fontSize: '2rem', marginTop: '0.5rem', letterSpacing: '-0.5px' }}>{summary?.totalUnits || 0}</h2>
        </div>
        <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: '500' }}>POS vs Online (Orders)</span>
            <TrendingUp className="icon-sm" style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{summary?.breakdown?.POS?.orders || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>POS</div>
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{summary?.breakdown?.ONLINE?.orders || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Online</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Sales Trend (Revenue)</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue (₹)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Top 5 Products</h3>
          <TopProducts topProducts={topProducts} />
        </div>
      </div>
      <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
        <h3 style={{ marginBottom: '1rem' }}>Best Profitable Products</h3>
        <BestProfitableProducts products={bestProfitableProducts} />
      </div>

      {/* ML Forecast & Low Stock */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        
        <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><Zap className="icon-sm" color="#f59e0b" /> ML Demand Forecasting</h3>
          
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Model Training</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Train the Random Forest model on historical sales data to predict future demand.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button onClick={handleTrainModel} disabled={training} className="btn-primary">
                {training ? 'Training...' : 'Train Model'}
              </button>
              <span style={{ fontSize: '0.875rem', color: mlStatus.includes('failed') ? 'red' : 'green' }}>{mlStatus}</span>
            </div>
            {mlMetrics && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                <p><strong>MAE:</strong> {mlMetrics.mae.toFixed(2)} | <strong>RMSE:</strong> {mlMetrics.rmse.toFixed(2)}</p>
                {mlMetrics.metadata && (
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#eef2ff', borderRadius: '4px' }}>
                    <p><strong>Training Data:</strong></p>
                    <ul style={{ margin: '0.25rem 0 0 1.5rem' }}>
                      <li>Real Sales Records: {mlMetrics.metadata.realSalesRecords}</li>
                      <li>Sources: {mlMetrics.metadata.sources}</li>
                      <li>Historical Period: {mlMetrics.metadata.historicalPeriod}</li>
                      <li>Last Trained: {new Date(mlMetrics.metadata.lastTrained).toLocaleString()}</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Predict Future Demand</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Select Product</label>
                <select 
                  value={forecastInput.productId} 
                  onChange={e => setForecastInput({...forecastInput, productId: e.target.value})} 
                  className="input" 
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                  <option value="">-- Choose Product --</option>
                  {stockOutRisk.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Target Date</label>
                <input 
                  type="date" 
                  value={forecastInput.targetDate} 
                  onChange={e => setForecastInput({...forecastInput, targetDate: e.target.value})} 
                  className="input" 
                  style={{ width: '100%', padding: '0.5rem' }} 
                />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button onClick={handlePredict} disabled={predicting || !forecastInput.productId || !forecastInput.targetDate} className="btn-outline">
                {predicting ? 'Predicting...' : 'Predict Demand'}
              </button>
            </div>
            {prediction && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'white', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <h5 style={{ marginBottom: '0.5rem' }}>Prediction Results for {prediction.product}</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Predicted Daily Demand</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>{prediction.predicted_quantity.toFixed(1)} units</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Coverage</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{prediction.daysCoverage > 900 ? 'N/A' : `${prediction.daysCoverage.toFixed(1)} days`}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Stock</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{prediction.stock} units</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Risk Level</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: prediction.risk === 'CRITICAL' ? '#dc2626' : prediction.risk === 'HIGH' ? '#ea580c' : '#16a34a' }}>{prediction.risk}</div>
                  </div>
                </div>
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '4px', borderLeft: '4px solid var(--primary)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Recommendation</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>{prediction.recommendation}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#b91c1c' }}><AlertTriangle className="icon-sm" /> Stock-Out Risk</h3>
          <StockOutRisk stockOutRisk={stockOutRisk} />
        </div>

        <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)', gridColumn: '1 / -1' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><Users className="icon-sm" /> Customer Intelligence</h3>
          <Customer360 customerSegmentsData={customerSegmentsData} />
        </div>
        
        {/* Anomaly Detection Section */}
        <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)', gridColumn: '1 / -1' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><Activity className="icon-sm" /> Sales Anomaly Detection</h3>
          
          {!salesAnomalies ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading anomaly data...</p>
          ) : salesAnomalies.status === 'insufficient-data' ? (
            <p style={{ color: 'var(--text-muted)' }}>{salesAnomalies.message}</p>
          ) : salesAnomalies.status === 'unavailable' ? (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '6px', color: '#b91c1c' }}>
              <strong>ML Service Unavailable:</strong> {salesAnomalies.message}
            </div>
          ) : (
            <div>
              {(() => {
                const anomalies = salesAnomalies.data.filter(a => a.is_anomaly);
                if (anomalies.length === 0) {
                  return <p style={{ color: '#16a34a', fontWeight: '500' }}>All sales data looks normal. No anomalies detected.</p>;
                }
                
                return (
                  <div>
                    <div style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 'bold', color: '#dc2626' }}>
                      {anomalies.length} {anomalies.length === 1 ? 'Anomaly' : 'Anomalies'} Detected!
                    </div>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                        <thead style={{ background: '#f9fafb', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0 }}>
                          <tr>
                            <th style={{ padding: '0.75rem' }}>Date</th>
                            <th style={{ padding: '0.75rem' }}>Revenue</th>
                            <th style={{ padding: '0.75rem' }}>Orders</th>
                            <th style={{ padding: '0.75rem' }}>Severity</th>
                            <th style={{ padding: '0.75rem' }}>Business Interpretation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {anomalies.map((a, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                              <td style={{ padding: '0.75rem', fontWeight: '500' }}>{a.date}</td>
                              <td style={{ padding: '0.75rem' }}>{formatCurrency(a.revenue)}</td>
                              <td style={{ padding: '0.75rem' }}>{a.orders}</td>
                              <td style={{ padding: '0.75rem' }}>
                                <span style={{ 
                                  padding: '0.25rem 0.5rem', 
                                  borderRadius: '4px',
                                  fontWeight: 'bold',
                                  background: a.severity === 'HIGH' ? '#fef2f2' : '#fff7ed',
                                  color: a.severity === 'HIGH' ? '#ef4444' : '#f97316'
                                }}>
                                  {a.severity}
                                </span>
                              </td>
                              <td style={{ padding: '0.75rem', fontSize: '0.8rem', color: '#475569' }}>
                                {a.business_interpretation}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Customer Intelligence Detail Modal */}
      {selectedCustomer && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users className="icon" /> Customer 360 View</h2>
              <button onClick={() => setSelectedCustomer(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Customer Profile</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{selectedCustomer.name}</div>
                <div>{selectedCustomer.email}</div>
                <div>{selectedCustomer.phone}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>ML Segment</div>
                <div style={{ 
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '999px',
                  fontWeight: 'bold',
                  background: selectedCustomer.segment === 'High Value' ? '#f0fdf4' : selectedCustomer.segment === 'At Risk' ? '#fef2f2' : '#f8fafc',
                  color: selectedCustomer.segment === 'High Value' ? '#16a34a' : selectedCustomer.segment === 'At Risk' ? '#dc2626' : '#475569'
                }}>
                  {selectedCustomer.segment}
                </div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Transaction History</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Historical Lifetime Spend</div>
                  <div style={{ fontWeight: 'bold' }}>{formatCurrency(selectedCustomer.monetary)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Average Order Value</div>
                  <div style={{ fontWeight: 'bold' }}>{formatCurrency(selectedCustomer.aov)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Items Purchased</div>
                  <div style={{ fontWeight: 'bold' }}>{selectedCustomer.total_quantity} units</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Orders</div>
                  <div style={{ fontWeight: 'bold' }}>{selectedCustomer.frequency}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Online Orders</div>
                  <div style={{ fontWeight: 'bold' }}>{selectedCustomer.online_orders}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>POS Orders</div>
                  <div style={{ fontWeight: 'bold' }}>{selectedCustomer.pos_orders}</div>
                </div>
              </div>
            </div>

            <div style={{ background: selectedCustomer.risk_level === 'High Risk' ? '#fef2f2' : selectedCustomer.risk_level === 'Medium Risk' ? '#fff7ed' : '#f0fdf4', padding: '1rem', borderRadius: '6px', border: '1px solid', borderColor: selectedCustomer.risk_level === 'High Risk' ? '#fecaca' : selectedCustomer.risk_level === 'Medium Risk' ? '#fed7aa' : '#bbf7d0', marginBottom: '1.5rem' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: selectedCustomer.risk_level === 'High Risk' ? '#dc2626' : selectedCustomer.risk_level === 'Medium Risk' ? '#ea580c' : '#16a34a' }}>
                <AlertTriangle className="icon-sm" /> Behavioral Risk: {selectedCustomer.risk_level}
              </h4>
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#475569' }}>{selectedCustomer.risk_reason}</p>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap className="icon-sm" color="#f59e0b" /> Data-Driven Recommendation
              </h4>
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#475569', fontWeight: '500' }}>
                {selectedCustomer.recommendation}
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
