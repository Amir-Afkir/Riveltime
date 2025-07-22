import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema({
  // --- En-tête de commande (identifiants, client, boutique, produits)
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deliverer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  boutique: { type: mongoose.Schema.Types.ObjectId, ref: 'Boutique', required: true },
  orderNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  items: [orderItemSchema],
  produitsTotal: { type: Number, required: true },
  totalPrice: { type: Number, required: true },

  // --- Détails de livraison
  boutiqueAddress: { type: String, required: true },
  boutiqueLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  deliveryFee: { type: Number, required: true },
  deliveryAddress: { type: String, required: true },
  deliveryLocation: {
    lat: Number,
    lng: Number
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'on_the_way', 'delivered', 'cancelled'],
    default: 'pending',
  },

  // --- Informations de paiement Stripe
  paymentIntentId: { type: String, required: true },
  checkoutSessionId: { type: String },
  captureStatus: {
    type: String,
    enum: ['authorized', 'succeeded', 'canceled', 'failed'],
    default: 'authorized',
  },
  transferGroup: { type: String, required: true },
  vendeurStripeId: { type: String, required: true },
  livreurStripeId: { type: String },

  // --- Informations figées (snapshot)
  clientNom: { type: String },
  clientTelephone: { type: String },
  boutiqueNom: { type: String },
  boutiqueTelephone: { type: String },

  // --- Détails logistiques
  vehiculeRecommande: { type: String },
  estimatedDelayMinutes: { type: Number },
  estimatedDelayFormatted: { type: String },
  poidsTotalKg: { type: Number },
  volumeTotalM3: { type: Number },
  poidsFacture: { type: Number },
  distanceKm: { type: Number },

  // --- Détails financiers
  participation: { type: Number, required: true },
  fraisLivraison: { type: Number, required: true },
  totalLivraison: { type: Number },
  commissionPlateforme: { type: Number },
  
  // --- Historique
  stripeStatusHistory: [
    {
      status: { type: String },
      event: { type: String },
      date: { type: Date, default: Date.now }
    }
  ],
  deliveryStatusHistory: [
    {
      status: { type: String },
      date: { type: Date, default: Date.now }
    }
  ],
  placedAt: { type: Date, default: Date.now },

  // --- Sécurité (code de vérification)
  codeVerificationClient: { type: String },
}, { timestamps: true });

orderSchema.index({ client: 1 });
orderSchema.index({ deliverer: 1 });

export default mongoose.model('Order', orderSchema);