const express = require('express');
const { 
  getSummary, getSalesTrends, getTopProducts, getBestProfitableProducts, getLowStock, getMlSalesData,
  trainMlModel, predictDemand, getStockOutRisk, getCustomerSegmentation, getSalesAnomalies
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('MANAGER', 'OWNER', 'ADMIN')); // Only high-level roles

router.get('/summary', getSummary);
router.get('/sales-trends', getSalesTrends);
router.get('/top-products', getTopProducts);
router.get('/best-profitable-products', getBestProfitableProducts);
router.get('/low-stock', getLowStock);
router.get('/stock-out-risk', getStockOutRisk);
router.get('/customer-segments', getCustomerSegmentation);
router.get('/sales-anomalies', getSalesAnomalies);
router.get('/ml/sales-data', getMlSalesData); 
router.post('/ml/train', trainMlModel);
router.post('/ml/predict', predictDemand);

module.exports = router;
