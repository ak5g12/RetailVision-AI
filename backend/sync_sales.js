require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/Order');
const HistoricalSales = require('./src/models/HistoricalSales');

async function fixDB() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // 1. Remove all ONLINE/POS historical sales because we will re-sync them
  await HistoricalSales.deleteMany({ source: { $in: ['ONLINE', 'POS'] } });
  
  // 2. Fetch all orders
  const orders = await Order.find();
  let synced = 0;
  for (const orderDoc of orders) {
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
        await HistoricalSales.insertMany(records, { ordered: false });
        synced += records.length;
      }
    }
  }
  console.log(`Re-synced ${synced} valid ONLINE/POS records.`);
  process.exit(0);
}

fixDB().catch(console.error);
