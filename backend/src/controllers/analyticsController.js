const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Helper to parse date filters
const getDateFilter = (startDate, endDate) => {
  const filter = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }
  return filter;
};

// GET /api/analytics/summary
const getSummary = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const match = getDateFilter(startDate, endDate);
      // Only count valid completed/paid sales. Exclude CANCELLED, PENDING, FAILED, REFUNDED.
      match.orderStatus = { $nin: ['CANCELLED', 'PENDING', 'FAILED', 'REFUNDED'] };
      match.paymentStatus = { $nin: ['FAILED', 'REFUNDED', 'PENDING'] };
  
      const pipeline = [
        { $match: match },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$_id",
            source: { $first: "$source" },
            orderRevenue: {
              $sum: { $multiply: ["$items.price", "$items.quantity"] }
            },
            orderCost: {
              $sum: { $multiply: [{ $ifNull: ["$items.costPrice", 0] }, "$items.quantity"] }
            },
            orderUnits: { $sum: "$items.quantity" }
          }
        },
        {
          $group: {
            _id: "$source",
            totalRevenue: { $sum: "$orderRevenue" },
            totalCost: { $sum: "$orderCost" },
            totalOrders: { $sum: 1 },
            totalUnits: { $sum: "$orderUnits" }
          }
        }
      ];
  
      const results = await Order.aggregate(pipeline);
      
      let totalRevenue = 0;
      let totalCost = 0;
      let totalOrders = 0;
      let totalUnits = 0;
      const breakdown = { ONLINE: { revenue: 0, orders: 0 }, POS: { revenue: 0, orders: 0 } };
  
      results.forEach(r => {
        totalRevenue += r.totalRevenue || 0;
        totalCost += r.totalCost || 0;
        totalOrders += r.totalOrders || 0;
        totalUnits += r.totalUnits || 0;
        if (breakdown[r._id]) {
          breakdown[r._id].revenue = r.totalRevenue || 0;
          breakdown[r._id].orders = r.totalOrders || 0;
        }
      });
  
      const totalGrossProfit = totalRevenue - totalCost;
      const profitMargin = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;
  
      res.json({ totalRevenue, totalCost, totalGrossProfit, profitMargin, totalOrders, totalUnits, breakdown });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// GET /api/analytics/sales-trends
const getSalesTrends = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = getDateFilter(startDate, endDate);
    match.orderStatus = { $nin: ['CANCELLED', 'PENDING', 'FAILED', 'REFUNDED'] };
    match.paymentStatus = { $nin: ['FAILED', 'REFUNDED', 'PENDING'] };

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];

    const trends = await Order.aggregate(pipeline);
    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/analytics/top-products
const getTopProducts = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = getDateFilter(startDate, endDate);
    // Exclude unfinalized/invalid orders
    match.orderStatus = { $nin: ['CANCELLED', 'PENDING', 'FAILED', 'REFUNDED'] };
    match.paymentStatus = { $nin: ['FAILED', 'REFUNDED', 'PENDING'] };

    const pipeline = [
      { $match: match },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ];

    const products = await Order.aggregate(pipeline);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBestProfitableProducts = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = getDateFilter(startDate, endDate);
    match.orderStatus = { $nin: ['CANCELLED', 'PENDING', 'FAILED', 'REFUNDED'] };
    match.paymentStatus = { $nin: ['FAILED', 'REFUNDED', 'PENDING'] };

    const pipeline = [
      { $match: match },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          validCostItems: { 
            $sum: { 
              $cond: [{ $gt: [{ $ifNull: ['$items.costPrice', 0] }, 0] }, 1, 0] 
            } 
          },
          totalItems: { $sum: 1 },
          totalCostCalc: { 
            $sum: { 
              $cond: [
                { $gt: [{ $ifNull: ['$items.costPrice', 0] }, 0] }, 
                { $multiply: ['$items.costPrice', '$items.quantity'] }, 
                0 
              ] 
            } 
          },
          revenueForMargin: { 
            $sum: { 
              $cond: [
                { $gt: [{ $ifNull: ['$items.costPrice', 0] }, 0] }, 
                { $multiply: ['$items.price', '$items.quantity'] }, 
                0 
              ] 
            } 
          }
        }
      },
      {
        $addFields: {
          hasSufficientCostData: { $eq: ['$validCostItems', '$totalItems'] },
          totalCost: { $cond: [{ $gt: ['$validCostItems', 0] }, '$totalCostCalc', null] },
          grossProfit: { 
            $cond: [
              { $gt: ['$validCostItems', 0] }, 
              { $subtract: ['$revenueForMargin', '$totalCostCalc'] }, 
              null 
            ] 
          },
          profitMargin: {
            $cond: [
              { $and: [{ $gt: ['$validCostItems', 0] }, { $gt: ['$revenueForMargin', 0] }] },
              { $multiply: [{ $divide: [{ $subtract: ['$revenueForMargin', '$totalCostCalc'] }, '$revenueForMargin'] }, 100] },
              null
            ]
          }
        }
      },
      { $sort: { grossProfit: -1 } },
      { $limit: 10 }
    ];

    const products = await Order.aggregate(pipeline);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/analytics/low-stock
const getLowStock = async (req, res) => {
  try {
    const threshold = Number(req.query.threshold) || 10;
    const products = await Product.find({ stock: { $lte: threshold }, active: true })
      .select('name SKU stock price')
      .sort({ stock: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const HistoricalSales = require('../models/HistoricalSales');

// GET /api/analytics/ml/sales-data
// Protected for ML service specifically, but we'll use ADMIN/OWNER logic for now.
const getMlSalesData = async (req, res) => {
  try {
    const historicalPipeline = [
      {
        $match: {
          source: { $in: ['POS', 'ONLINE', 'IMPORTED'] }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            productId: '$product'
          },
          quantity: { $sum: '$quantity' },
          revenue: { $sum: { $multiply: ['$price', '$quantity'] } }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id.date',
          productId: '$_id.productId',
          quantity: 1,
          revenue: 1
        }
      },
      { $sort: { date: 1 } }
    ];

    const finalData = await HistoricalSales.aggregate(historicalPipeline);

    res.json(finalData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const trainMlModel = async (req, res) => {
  try {
    const axios = require('axios');
    const token = req.headers.authorization?.split(' ')[1];
    
    // Call Python ML service on port 8000
    const mlResponse = await axios.post('http://127.0.0.1:8000/api/forecast/train', {
      token: token
    });
    
    // Calculate DB metadata for dashboard transparency
    const HistoricalSales = require('../models/HistoricalSales');
    const totalRecords = await HistoricalSales.countDocuments({ source: { $in: ['POS', 'ONLINE', 'IMPORTED'] } });
    const firstRecord = await HistoricalSales.findOne({ source: { $in: ['POS', 'ONLINE', 'IMPORTED'] } }).sort({ date: 1 });
    const lastRecord = await HistoricalSales.findOne({ source: { $in: ['POS', 'ONLINE', 'IMPORTED'] } }).sort({ date: -1 });

    const metadata = {
      realSalesRecords: totalRecords,
      sources: 'POS + ONLINE + IMPORTED',
      historicalPeriod: firstRecord && lastRecord 
        ? `${firstRecord.date.toISOString().split('T')[0]} to ${lastRecord.date.toISOString().split('T')[0]}`
        : 'N/A',
      lastTrained: new Date().toISOString()
    };
    
    res.json({ ...mlResponse.data, metadata });
  } catch (error) {
    res.status(error.response?.status || 500).json({ 
      message: error.response?.data?.detail || 'Failed to train ML model' 
    });
  }
};

const predictDemand = async (req, res) => {
  try {
    const { productId, targetDate } = req.body;
    if (!productId || !targetDate) {
      return res.status(400).json({ message: 'productId and targetDate are required' });
    }
    
    const target = new Date(targetDate);
    const day_of_week = target.getDay() === 0 ? 7 : target.getDay(); // 1=Mon, 7=Sun
    const month = target.getMonth() + 1;
    const day = target.getDate();
    
    // Fetch product stock
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    // Calculate lags
    const dateMinus1 = new Date(target); dateMinus1.setDate(dateMinus1.getDate() - 1);
    const dateMinus7 = new Date(target); dateMinus7.setDate(dateMinus7.getDate() - 7);
    
    const getLag = async (d) => {
      const startOfDay = new Date(d.setHours(0,0,0,0));
      const endOfDay = new Date(d.setHours(23,59,59,999));
      const sales = await HistoricalSales.aggregate([
        { $match: { product: product._id, date: { $gte: startOfDay, $lte: endOfDay }, source: { $in: ['POS', 'ONLINE', 'IMPORTED'] } } },
        { $group: { _id: null, qty: { $sum: '$quantity' } } }
      ]);
      return sales.length > 0 ? sales[0].qty : 0;
    };
    
    const qty_lag_1 = await getLag(dateMinus1);
    const qty_lag_7 = await getLag(dateMinus7);
    
    const features = { day_of_week, month, day, qty_lag_1, qty_lag_7 };
    
    const axios = require('axios');
    const mlResponse = await axios.post('http://127.0.0.1:8000/api/forecast/predict', features);
    
    const predicted_quantity = mlResponse.data.predicted_quantity;
    
    // Calculate stock coverage
    const daysCoverage = predicted_quantity > 0 ? product.stock / predicted_quantity : 999;
    
    let risk = 'LOW';
    let recommendation = 'Stock healthy';
    if (daysCoverage <= 7) {
      risk = 'CRITICAL';
      recommendation = `Reorder immediately. Estimated ${daysCoverage.toFixed(1)} days coverage.`;
    } else if (daysCoverage <= 14) {
      risk = 'HIGH';
      recommendation = `Plan reorder. Estimated ${daysCoverage.toFixed(1)} days coverage.`;
    } else if (daysCoverage <= 30) {
      risk = 'MEDIUM';
      recommendation = 'Monitor stock.';
    }
    
    res.json({
      product: product.name,
      stock: product.stock,
      features,
      predicted_quantity,
      daysCoverage,
      risk,
      recommendation
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({ 
      message: error.response?.data?.detail || error.message || 'Failed to predict demand' 
    });
  }
};

const getStockOutRisk = async (req, res) => {
  try {
    const products = await Product.find({ active: true }).select('name SKU stock price');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const HistoricalSales = require('../models/HistoricalSales');
      const histSales = await HistoricalSales.aggregate([
        { $match: { 
            date: { $gte: thirtyDaysAgo }
        }},
        { $group: { _id: '$product', totalQty: { $sum: '$quantity' } } }
      ]);

    const salesMap = {};
    histSales.forEach(s => salesMap[s._id.toString()] = (salesMap[s._id.toString()] || 0) + s.totalQty);

    const riskData = products.map(p => {
      const soldLast30 = salesMap[p._id.toString()] || 0;
      
      // If soldLast30 is 0, we have insufficient data for an accurate avg daily demand
      let avgDailyDemand = 0;
      let daysRemaining = -1;
      let riskLevel = 'UNKNOWN';
      let recommendedAction = 'No data';

      if (soldLast30 > 0) {
        avgDailyDemand = soldLast30 / 30;
        daysRemaining = p.stock / avgDailyDemand;
        if (daysRemaining <= 7) {
          riskLevel = 'CRITICAL';
          recommendedAction = 'Reorder immediately';
        } else if (daysRemaining <= 14) {
          riskLevel = 'HIGH';
          recommendedAction = 'Plan reorder';
        } else if (daysRemaining <= 30) {
          riskLevel = 'MEDIUM';
          recommendedAction = 'Monitor stock';
        } else {
          riskLevel = 'LOW';
          recommendedAction = 'Stock healthy';
        }
      } else {
        if (p.stock === 0) {
          riskLevel = 'CRITICAL';
          daysRemaining = 0;
          recommendedAction = 'Out of stock';
        } else {
          riskLevel = 'UNKNOWN';
          daysRemaining = null;
          recommendedAction = 'Insufficient data';
        }
      }

      return {
        _id: p._id,
        name: p.name,
        SKU: p.SKU,
        stock: p.stock,
        soldLast30,
        avgDailyDemand,
        daysRemaining,
        riskLevel,
        recommendedAction
      };
    });

    res.json(riskData.sort((a, b) => {
      const levels = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3, 'UNKNOWN': 4 };
      return levels[a.riskLevel] - levels[b.riskLevel];
    }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCustomerSegmentation = async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.find({ role: 'CUSTOMER' }).select('name email phone createdAt');
    
    const now = new Date();
    const rfmMap = {};

    for (const u of users) {
      rfmMap[u._id.toString()] = {
        customer_id: u._id.toString(),
        name: u.name,
        email: u.email,
        phone: u.phone,
        recency: 999,
        frequency: 0,
        monetary: 0,
        online_orders: 0,
        pos_orders: 0,
        total_quantity: 0,
        first_purchase_date: null,
        last_purchase_date: null
      };
    }

    const orders = await Order.find({ 
      orderStatus: { $nin: ['CANCELLED', 'PENDING'] },
      paymentStatus: { $nin: ['FAILED', 'REFUNDED', 'PENDING'] },
      source: { $in: ['ONLINE', 'POS'] }
    }).select('customer total createdAt source items orderNumber').sort({ createdAt: -1 });

    for (const o of orders) {
      if (o.customer && rfmMap[o.customer.toString()]) {
        const c = rfmMap[o.customer.toString()];
        const orderDate = new Date(o.createdAt);
        const daysAgo = (now - orderDate) / (1000 * 60 * 60 * 24);
        if (daysAgo < c.recency) c.recency = daysAgo;
        
        c.frequency += 1;
        c.monetary += o.total;
        
        let orderQty = 0;
        o.items.forEach(item => {
          const q = item.quantity || 1;
          orderQty += q;
          if (!c.product_breakdown) c.product_breakdown = {};
          if (!c.product_breakdown[item.name]) c.product_breakdown[item.name] = 0;
          c.product_breakdown[item.name] += q;
        });
        c.total_quantity += orderQty;
        
        if (o.source === 'ONLINE') c.online_orders += 1;
        if (o.source === 'POS') c.pos_orders += 1;
        
        if (!c.first_purchase_date || orderDate < c.first_purchase_date) {
          c.first_purchase_date = orderDate;
        }
        if (!c.last_purchase_date || orderDate > c.last_purchase_date) {
          c.last_purchase_date = orderDate;
        }

        if (!c.transactions) c.transactions = [];
        if (c.transactions.length < 5) {
          c.transactions.push({
            orderNumber: o.orderNumber,
            date: o.createdAt,
            total: o.total,
            source: o.source,
            items: orderQty
          });
        }
      }
    }

    // Prepare payload
    let customersPayload = Object.values(rfmMap).filter(c => c.frequency > 0);
    
    // Calculate AOV and Behavioral Risk / Recommendations
    customersPayload = customersPayload.map(c => {
      c.aov = c.frequency > 0 ? c.monetary / c.frequency : 0;
      
      // Data-Driven Risk Score
      let riskLevel = 'Low Risk';
      let riskReason = 'Active and healthy purchasing behavior.';
      
      if (c.recency > 90 && c.frequency > 1) {
        riskLevel = 'High Risk';
        riskReason = 'Previous repeat buyer who has not purchased in over 90 days.';
      } else if (c.recency > 60) {
        riskLevel = 'Medium Risk';
        riskReason = 'Has not purchased in over 60 days.';
      } else if (c.frequency === 1 && c.recency > 30) {
        riskLevel = 'Medium Risk';
        riskReason = 'One-time buyer with no recent activity, potential drop-off.';
      }

      c.risk_level = riskLevel;
      c.risk_reason = riskReason;
      
      // Data-Driven Recommendation
      let recommendation = '';
      if (riskLevel === 'High Risk') {
        recommendation = 'Customer is at high risk of churn. Send a targeted win-back offer.';
      } else if (c.monetary > 1000) {
        recommendation = 'High-value historical customer. Prioritize VIP retention and loyalty rewards.';
      } else if (c.pos_orders > c.online_orders && c.online_orders === 0) {
        recommendation = 'Frequent POS buyer. Encourage them to try the online store with a digital coupon.';
      } else if (c.frequency === 1) {
        recommendation = 'New customer. Encourage a second purchase to establish habit.';
      } else {
        recommendation = 'Regular customer. Continue standard marketing engagement.';
      }
      
      c.recommendation = recommendation;
      
      return c;
    });

    // We do NOT use heuristics for Segmentation anymore. We only use ML.
    if (customersPayload.length < 10) {
      return res.json({
        status: 'insufficient-data',
        message: 'Insufficient data for ML segmentation. Need at least 10 active customers.',
        data: customersPayload
      });
    }

    let segments = [];
    try {
      const axios = require('axios');
      if (req.query.train === 'true') {
        await axios.post('http://127.0.0.1:8000/api/segmentation/train', { customers: customersPayload });
      }
      
      const mlRes = await axios.post('http://127.0.0.1:8000/api/segmentation/predict', { customers: customersPayload });
      segments = mlRes.data.predictions;
      
      const result = customersPayload.map(c => {
        const seg = segments.find(s => s.customer_id === c.customer_id);
        return { ...c, segment: seg ? seg.segment : 'Unknown' };
      });
      
      res.json({ status: 'success', data: result });
    } catch (err) {
      res.json({
        status: 'unavailable',
        message: 'ML Segmentation service is unavailable.',
        data: customersPayload
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSalesAnomalies = async (req, res) => {
  try {
    // Generate daily time-series data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Group historical by day
    const histPipeline = [
      { $match: { date: { $gte: thirtyDaysAgo }, source: { $in: ['POS', 'ONLINE', 'IMPORTED'] } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          revenue: { $sum: { $multiply: ['$price', '$quantity'] } },
          orders: { $sum: 1 } // Approximating row count as order count for simplicity
        }
      },
      { $sort: { _id: 1 } }
    ];

    const histData = await HistoricalSales.aggregate(histPipeline);

    const payload = histData.map(item => ({
      date: item._id,
      revenue: item.revenue,
      orders: item.orders
    }));

    // Fast fail if not enough data
    if (payload.length < 14) {
      return res.status(200).json({
        status: 'insufficient-data',
        message: 'Insufficient historical data. Need at least 14 days of history.',
        data: []
      });
    }

    try {
      const axios = require('axios');
      // If client requested train
      if (req.query.train === 'true') {
        await axios.post('http://127.0.0.1:8000/api/anomaly/train', { data: payload });
      }
      
      const mlRes = await axios.post('http://127.0.0.1:8000/api/anomaly/predict', { data: payload });
      
      // Calculate a simple baseline (average of last 14 days) to give context
      const recentData = payload.slice(-14);
      const avgRevenue = recentData.reduce((sum, item) => sum + item.revenue, 0) / recentData.length;
      
      const enrichedPredictions = mlRes.data.predictions.map(pred => {
        if (!pred.is_anomaly) return pred;
        
        let interpretation = '';
        if (pred.revenue > avgRevenue * 1.5) {
          interpretation = 'Unusual sales spike detected.';
        } else if (pred.revenue < avgRevenue * 0.5) {
          interpretation = 'Unusually low sales detected.';
        } else {
          interpretation = 'Abnormal sales pattern detected.';
        }
        
        return {
          ...pred,
          baseline_expected: avgRevenue,
          business_interpretation: `${interpretation} Possible cause requires business verification.`
        };
      });

      return res.status(200).json({
        status: 'success',
        data: enrichedPredictions
      });
    } catch (err) {
      // Prompt explicitly says: do NOT silently replace ML algorithm with Node.js threshold logic.
      // Show/report that ML analysis is unavailable.
      return res.status(200).json({
        status: 'unavailable',
        message: 'ML anomaly detection service is currently unavailable. No heuristic fallback applied.',
        data: []
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSummary,
  getSalesTrends,
  getTopProducts,
  getBestProfitableProducts,
  getLowStock,
  getMlSalesData,
  trainMlModel,
  predictDemand,
  getStockOutRisk,
  getCustomerSegmentation,
  getSalesAnomalies
};
