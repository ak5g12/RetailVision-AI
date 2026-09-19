const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);
require('dotenv').config();
const Product = require('./src/models/Product');

async function checkImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const products = await Product.find({}, 'name brand images');
    for (const p of products) {
      console.log(`[${p.brand}] ${p.name}`);
      console.log(p.images);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkImages();
