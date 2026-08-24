const mongoose = require('mongoose');

const historicalSalesSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  costPrice: {
    type: Number,
    min: 0,
    default: 0
  },
  date: {
    type: Date,
    required: true
  },
  source: {
    type: String,
    enum: ['SYNTHETIC', 'POS', 'ONLINE', 'IMPORTED'],
    default: 'IMPORTED'
  },
  orderRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  orderItemRef: {
    type: mongoose.Schema.Types.ObjectId
  }
}, { timestamps: true });

historicalSalesSchema.index(
  { orderItemRef: 1 }, 
  { unique: true, partialFilterExpression: { orderItemRef: { $exists: true } } }
);

module.exports = mongoose.model('HistoricalSales', historicalSalesSchema);
