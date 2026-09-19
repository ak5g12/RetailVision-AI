const mongoose = require('mongoose');
const Product = require('./models/Product');
const Order = require('./models/Order');

mongoose.connect('mongodb://localhost:27017/retailvision').then(async () => {
  console.log('Connected to DB. Starting migration...');
  
  // Migrate Products
  const products = await Product.find({ $or: [{ costPrice: null }, { costPrice: 0 }, { costPrice: { $exists: false } }] });
  console.log(`Found ${products.length} products missing costPrice.`);
  let migrated = 0;
  for (let p of products) {
    if (p.price > 0) {
      // Set reasonable cost price, e.g. 60% of selling price
      p.costPrice = Number((p.price * 0.6).toFixed(2));
      await p.save();
      migrated++;
    }
  }
  console.log(`Migrated ${migrated} products with valid CP.`);
  
  // Also migrate Orders so past orders have costPrice based on product's current costPrice
  const orders = await Order.find({});
  let ordersMigrated = 0;
  for (let o of orders) {
    let orderChanged = false;
    for (let item of o.items) {
      if (!item.costPrice || item.costPrice === 0) {
        const prod = await Product.findById(item.product);
        if (prod && prod.costPrice) {
          item.costPrice = prod.costPrice;
          orderChanged = true;
        } else if (item.price > 0) {
          item.costPrice = Number((item.price * 0.6).toFixed(2));
          orderChanged = true;
        }
      }
    }
    if (orderChanged) {
      // skip validation to avoid breaking old orders
      await Order.collection.updateOne({ _id: o._id }, { $set: { items: o.items } });
      ordersMigrated++;
    }
  }
  console.log(`Migrated ${ordersMigrated} orders missing item costPrice.`);
  
  process.exit(0);
}).catch(console.error);
