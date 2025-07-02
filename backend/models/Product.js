// backend/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  seller: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  imageUrl: String,
  imagePublicId: String,
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  category: String,
}, { timestamps: true });



productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);