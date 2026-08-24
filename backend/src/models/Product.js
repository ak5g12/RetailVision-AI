const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  SKU: { type: String, required: true, unique: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: String },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  costPrice: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0 },
  images: [{ type: String }],
  specifications: { type: mongoose.Schema.Types.Mixed },
  active: { type: Boolean, default: true }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
