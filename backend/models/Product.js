import mongoose from 'mongoose';

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
    enum: ['petit_colis', 'sac_ou_vetement', 'carton_moyen', 'fragile', 'meuble', 'gros_objet'],
    default: 'carton_moyen'
  },
  poids_kg: { type: Number, default: 0.8 },
  volume_m3: { type: Number, default: 0.003 }
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', collectionName: 'text' });

export default mongoose.model('Product', productSchema);
