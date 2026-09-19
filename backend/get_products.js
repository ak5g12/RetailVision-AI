const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/.env' });
const Product = require('./src/models/Product');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const products = await Product.find({}).select('name SKU price brand category subcategory').lean();
    console.log(JSON.stringify(products, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}
run();
