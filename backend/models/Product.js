const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  boutique: { type: mongoose.Schema.Types.ObjectId, ref: 'Boutique', required: true },
  name: { type: String, required: true },
  description: String,
  imageUrl: String,
  imagePublicId: String,
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  collectionName: String,
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', collectionName: 'text' });

module.exports = mongoose.model('Product', productSchema);
