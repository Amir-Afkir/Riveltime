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
  logisticsCategory: {
    type: String,
    enum: ['small', 'medium', 'large', 'fragile'],
    default: 'medium'
  },
  poids_kg: { type: Number, default: 0.8 },
  volume_m3: { type: Number, default: 0.003 }
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', collectionName: 'text' });

module.exports = mongoose.model('Product', productSchema);
