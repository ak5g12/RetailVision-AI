const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
const crypto = require('crypto');
dotenv.config({ path: __dirname + '/.env' });

const Product = require('./src/models/Product');
const Order = require('./src/models/Order');
const HistoricalSales = require('./src/models/HistoricalSales');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Retroactively sync existing orders
    const existingOrders = await Order.find({ 
      orderStatus: { $ne: 'CANCELLED' },
      paymentStatus: { $nin: ['FAILED', 'REFUNDED'] }
    });
    
    let synced = 0;
    for (const order of existingOrders) {
      await HistoricalSales.deleteMany({ orderRef: order._id });
      const records = order.items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        date: order.createdAt,
        source: order.source,
        orderRef: order._id
      }));
      if (records.length > 0) {
        try {
          await HistoricalSales.insertMany(records, { ordered: false });
          synced += records.length;
        } catch(e) {}
      }
    }
    console.log(`Synced ${synced} existing real order items to HistoricalSales.`);

    // Generate Synthetic Data CSV
    const products = await Product.find({ active: true });
    
    const csvRows = ['date,sku,quantity,price'];
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let totalGenerated = 0;
    
    for (let i = 180; i >= 1; i--) {
      const currentDate = new Date(today.getTime());
      currentDate.setDate(currentDate.getDate() - i);
      
      const dayOfWeek = currentDate.getDay(); // 0 is Sunday, 6 is Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Gradually increasing trend over 180 days (0 to ~1.5x)
      const trendMultiplier = 1 + (180 - i) / 360; 
      
      for (const product of products) {
        // Base probability of a sale today
        let saleProb = 0.3; // 30% chance of no sale for a given product
        
        // Weekend bump
        const weekendMultiplier = isWeekend ? 1.5 : 1.0;
        
        // Product specific base demand based on price (cheaper = more volume)
        const priceMultiplier = Math.max(0.2, 50 / (product.price || 50));
        
        // Anomaly: 1% chance of a huge spike
        const isAnomaly = Math.random() < 0.01;
        const anomalyMultiplier = isAnomaly ? (3 + Math.random() * 3) : 1.0;
        
        if (Math.random() < saleProb) continue; // No sale today
        
        let qty = Math.ceil((Math.random() * 3) * trendMultiplier * weekendMultiplier * priceMultiplier * anomalyMultiplier);
        
        if (qty > 0) {
          const dateStr = currentDate.toISOString().split('T')[0];
          csvRows.push(`${dateStr},${product.SKU},${qty},${product.price}`);
          totalGenerated++;
        }
      }
    }
    
    fs.writeFileSync('synthetic_sales.csv', csvRows.join('\n'));
    console.log(`Generated ${totalGenerated} synthetic records in synthetic_sales.csv`);
    
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
