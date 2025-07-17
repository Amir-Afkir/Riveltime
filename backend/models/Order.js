const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const orderParBoutiqueSchema = new mongoose.Schema({
  boutique: { type: mongoose.Schema.Types.ObjectId, ref: 'boutique', required: true },
  produitsTotal: { type: Number, required: true },
  fraisLivraison: { type: Number, required: true },
  participation: { type: Number, required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true }
    }
  ],
  vendeurStripeId: { type: String, required: true },
  livreurStripeId: { type: String },
  transferGroup: { type: String, required: true }
});

const orderSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deliverer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Peut être null au départ
  items: [orderItemSchema],
  totalPrice: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'on_the_way', 'delivered', 'cancelled'],
    default: 'pending',
  },
  deliveryAddress: { type: String, required: true },
  deliveryLocation: {
    lat: Number,
    lng: Number
  },
  paymentIntentId: { type: String }, // ID Stripe de l’intention de paiement
  captureStatus: {
    type: String,
    enum: ['non_capture', 'capture_effectuée', 'capture_echouee'],
    default: 'non_capture',
  },
  placedAt: { type: Date, default: Date.now },
  ordersParBoutique: [orderParBoutiqueSchema],
}, { timestamps: true });

orderSchema.index({ client: 1 });
orderSchema.index({ deliverer: 1 });

module.exports = mongoose.model('Order', orderSchema);