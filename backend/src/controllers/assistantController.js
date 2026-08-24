const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const HistoricalSales = require('../models/HistoricalSales');
const { 
  getSummary, 
  getTopProducts, 
  getLowStock, 
  getStockOutRisk, 
  getCustomerSegmentation, 
  getSalesAnomalies 
} = require('./analyticsController');

// Helper to mock req/res for reusing analyticsController logic where possible
const executeControllerAction = async (controllerFn, req) => {
  return new Promise((resolve, reject) => {
    const res = {
      json: (data) => resolve({ status: 200, data }),
      status: (code) => {
        return {
          json: (data) => resolve({ status: code, data })
        };
      }
    };
    controllerFn(req, res).catch(reject);
  });
};

const parseIntent = (text) => {
  const t = text.toLowerCase();
  
  if (t.includes('anomaly') || t.includes('anomalies') || t.includes('abnormal')) return 'SALES_ANOMALIES';
  if (t.includes('stock-out') || t.includes('stock out') || t.includes('risk')) return 'STOCK_OUT_RISK';
  if (t.includes('low stock') || t.includes('attention') || t.includes('need attention')) return 'LOW_STOCK';
  if (t.includes('top product') || t.includes('most sold') || t.includes('sold the most') || t.includes('best selling')) return 'TOP_PRODUCTS';
  if (t.includes('customer segment') || t.includes('segments') || t.includes('spending')) return 'CUSTOMER_SEGMENTS';
  if (t.includes('pos vs online') || t.includes('online vs pos') || t.includes('through pos')) return 'POS_VS_ONLINE';
  if (t.includes('many orders') || t.includes('order summary') || t.includes('total orders')) return 'ORDER_SUMMARY';
  if (t.includes('trend') || t.includes('over time')) return 'SALES_TREND';
  if (t.includes('sales') || t.includes('revenue') || t.includes('total')) return 'SALES_SUMMARY';
  
  return 'UNKNOWN';
};

const handleQuery = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ reply: 'Please provide a valid question.' });
    }

    const intent = parseIntent(question);
    
    // Create a mock request object for analytics reuse
    const mockReq = { query: {} };
    let reply = '';

    switch (intent) {
      case 'SALES_SUMMARY': {
        const summary = await executeControllerAction(getSummary, mockReq);
        if (summary.status === 200) {
          const { totalRevenue, totalOrders, totalUnits } = summary.data;
          reply = `Total revenue is $${totalRevenue.toFixed(2)} from ${totalOrders} orders, with ${totalUnits} total units sold.`;
        } else {
          reply = 'Failed to fetch sales summary.';
        }
        break;
      }
      case 'POS_VS_ONLINE': {
        const summary = await executeControllerAction(getSummary, mockReq);
        if (summary.status === 200) {
          const { breakdown } = summary.data;
          const pos = breakdown?.POS || { revenue: 0, orders: 0 };
          const online = breakdown?.ONLINE || { revenue: 0, orders: 0 };
          reply = `POS Sales: $${pos.revenue.toFixed(2)} (${pos.orders} orders). ONLINE Sales: $${online.revenue.toFixed(2)} (${online.orders} orders).`;
        } else {
          reply = 'Failed to fetch POS vs ONLINE data.';
        }
        break;
      }
      case 'ORDER_SUMMARY': {
        const summary = await executeControllerAction(getSummary, mockReq);
        if (summary.status === 200) {
          reply = `A total of ${summary.data.totalOrders} orders were placed across all channels.`;
        } else {
          reply = 'Failed to fetch order summary.';
        }
        break;
      }
      case 'TOP_PRODUCTS': {
        const top = await executeControllerAction(getTopProducts, mockReq);
        if (top.status === 200 && top.data.length > 0) {
          const list = top.data.slice(0, 3).map((p, i) => `${i + 1}. ${p.name} (${p.totalSold} sold)`).join('\\n');
          reply = `Here are the top selling products:\\n${list}`;
        } else {
          reply = 'No top products found or data is unavailable.';
        }
        break;
      }
      case 'LOW_STOCK': {
        mockReq.query = { threshold: 10 };
        const low = await executeControllerAction(getLowStock, mockReq);
        if (low.status === 200 && low.data.length > 0) {
          const list = low.data.slice(0, 3).map(p => `- ${p.name} (${p.stock} left)`).join('\\n');
          reply = `These products are running low on stock (Threshold: 10):\\n${list}`;
        } else if (low.status === 200) {
          reply = 'All products are sufficiently stocked. No immediate attention needed.';
        } else {
          reply = 'Failed to fetch low stock data.';
        }
        break;
      }
      case 'STOCK_OUT_RISK': {
        const risk = await executeControllerAction(getStockOutRisk, mockReq);
        if (risk.status === 200) {
          const critical = risk.data.filter(r => r.riskLevel === 'CRITICAL');
          if (critical.length > 0) {
            const list = critical.slice(0, 3).map(p => `- ${p.name} (Est. ${p.daysRemaining.toFixed(1)} days)`).join('\\n');
            reply = `The following products have a CRITICAL stock-out risk:\\n${list}`;
          } else {
            reply = 'There are no products with a CRITICAL stock-out risk at the moment.';
          }
        } else {
          reply = 'Stock-out risk data is currently unavailable.';
        }
        break;
      }
      case 'CUSTOMER_SEGMENTS': {
        const seg = await executeControllerAction(getCustomerSegmentation, mockReq);
        if (seg.status === 200 && seg.data.data) {
          const data = seg.data.data;
          const segments = {};
          data.forEach(c => {
            if (!segments[c.segment]) segments[c.segment] = { count: 0, totalSpend: 0 };
            segments[c.segment].count += 1;
            segments[c.segment].totalSpend += c.monetary;
          });
          
          let highestSeg = '';
          let maxAvg = -1;
          for (const key in segments) {
            const avg = segments[key].totalSpend / segments[key].count;
            if (avg > maxAvg) {
               maxAvg = avg;
               highestSeg = key;
            }
          }
          
          if (highestSeg) {
            reply = `The "${highestSeg}" segment has the highest average spending at $${maxAvg.toFixed(2)} per customer.`;
          } else {
            reply = 'No customer segment data available.';
          }
        } else {
          reply = 'Customer segmentation is currently unavailable.';
        }
        break;
      }
      case 'SALES_ANOMALIES': {
        const anomaly = await executeControllerAction(getSalesAnomalies, mockReq);
        if (anomaly.status === 200) {
          if (anomaly.data.status === 'unavailable') {
            reply = 'The ML anomaly detection service is currently unavailable.';
          } else if (anomaly.data.status === 'insufficient-data') {
            reply = anomaly.data.message;
          } else {
            const anomalies = anomaly.data.data.filter(a => a.is_anomaly);
            if (anomalies.length > 0) {
              const list = anomalies.slice(0, 3).map(a => `- Date: ${a.date}, Revenue: $${a.revenue.toFixed(2)}, Severity: ${a.severity}`).join('\\n');
              reply = `We found ${anomalies.length} recent sales anomalies!\\nHere are the latest ones:\\n${list}`;
            } else {
              reply = 'All sales data looks normal. No anomalies detected by the ML service.';
            }
          }
        } else {
          reply = 'Failed to fetch sales anomaly data.';
        }
        break;
      }
      case 'SALES_TREND': {
        reply = 'Sales trends are best viewed visually on the Dashboard chart. Currently, I am a text assistant and do not generate graphs, but overall sales data indicates healthy activity. (Please check the Dashboard for the line chart).';
        break;
      }
      default:
        reply = 'That information is outside the current RetailVision business data. Please ask about sales, products, stock, anomalies, or customer segments.';
    }

    res.json({ reply, intent });

  } catch (error) {
    console.error('Assistant error:', error);
    res.status(500).json({ reply: 'An internal error occurred while processing your question.' });
  }
};

module.exports = {
  handleQuery
};
