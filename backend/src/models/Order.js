const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for POS walk-in
  cashier: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For POS orders
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 },
      costPrice: { type: Number, min: 0, default: 0 }
    }
  ],
  subtotal: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, enum: ['CASH', 'CARD', 'UPI', 'ONLINE_GATEWAY'], default: 'ONLINE_GATEWAY' },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'], default: 'PENDING' },
  orderStatus: { type: String, enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'COMPLETED'], default: 'PENDING' },
  source: { type: String, enum: ['ONLINE', 'POS'], required: true, default: 'ONLINE' }
}, { timestamps: true });
const HistoricalSales = require('./HistoricalSales');

async function syncHistoricalSales(orderDoc) {
  if (!orderDoc) return;
  // Remove existing records for this order first to keep it clean
  await HistoricalSales.deleteMany({ orderRef: orderDoc._id });

  if (
    orderDoc.orderStatus !== 'CANCELLED' && 
    orderDoc.orderStatus !== 'PENDING' &&
    orderDoc.paymentStatus !== 'FAILED' && 
    orderDoc.paymentStatus !== 'REFUNDED' &&
    orderDoc.paymentStatus !== 'PENDING'
  ) {
    const records = orderDoc.items.map(item => ({
      product: item.product,
      quantity: item.quantity,
      price: item.price,
      costPrice: item.costPrice || 0,
      date: orderDoc.createdAt || new Date(),
      source: orderDoc.source,
      orderRef: orderDoc._id,
      orderItemRef: item._id
    }));
    if (records.length > 0) {
      // Use ordered: false to gracefully handle any unexpected duplicates
      try {
        await HistoricalSales.insertMany(records, { ordered: false });
      } catch (err) {
        if (err.name !== 'BulkWriteError' || err.code !== 11000) {
          console.error('Error syncing HistoricalSales:', err);
        }
      }
    }
  }
}

orderSchema.post('save', async function (doc) {
  await syncHistoricalSales(doc);
});

orderSchema.post('findOneAndUpdate', async function (doc) {
  await syncHistoricalSales(doc);
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
