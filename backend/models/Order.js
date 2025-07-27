import mongoose from 'mongoose';

// Schéma pour un élément de commande (produit et quantité)
const orderItemSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: 1 
  },
});

// Schéma principal de la commande
const orderSchema = new mongoose.Schema({
  // --- En-tête de commande (identifiants, client, boutique, produits)
  client: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  deliverer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }, // Le livreur assigné à la commande
  boutique: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Boutique', 
    required: true 
  },
  orderNumber: { // Numéro de commande unique (ex: CMD-ABC123)
    type: String,
    unique: true,
    sparse: true, // Permet des valeurs nulles/manquantes sans erreur d'unicité
  },
  items: [orderItemSchema], // Liste des produits dans la commande
  produitsTotal: { 
    type: Number, 
    required: true 
  }, // Somme des prix des produits
  totalPrice: { 
    type: Number, 
    required: true 
  }, // Total final incluant produits et frais de livraison

  // --- Détails de livraison
  boutiqueAddress: { 
    type: String, 
    required: true 
  },
  boutiqueLocation: { // Coordonnées GPS de la boutique
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  deliveryFee: { 
    type: Number, 
    required: true 
  }, // Coût de la livraison calculé
  participation: { 
    type: Number, 
    required: true 
  }, // Participation du client aux frais de livraison (si différente de deliveryFee)
  totalLivraison: { 
    type: Number, 
    required: true 
  }, // Somme de deliveryFee et participation
  deliveryAddress: { 
    type: String, 
    required: true 
  },
  deliveryLocation: { // Coordonnées GPS du client pour la livraison
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  status: { // Statut actuel de la commande
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'on_the_way', 'delivered', 'cancelled'],
    default: 'pending',
  },
  deliveryStatusHistory: [{ // Historique des changements de statut de livraison
    status: { type: String, enum: ['pending', 'accepted', 'preparing', 'on_the_way', 'delivered', 'cancelled'] },
    date: { type: Date, default: Date.now },
  }],

  // --- Informations de paiement Stripe
  paymentIntentId: { 
    type: String, 
    required: true 
  },
  stripeAuthorizedAmount: { 
    type: Number 
  }, // Montant autorisé par Stripe en centimes
  stripeCreatedAt: { 
    type: Date 
  }, // Date de création du PaymentIntent (timestamp Stripe converti)
  checkoutSessionId: { 
    type: String 
  }, // Utilisé si vous utilisez Stripe Checkout
  captureStatus: { // Statut de capture du paiement Stripe
    type: String,
    enum: ['authorized', 'succeeded', 'captured', 'canceled', 'failed'],
    default: 'authorized',
  },
  transferGroup: { 
    type: String, 
    required: true 
  }, // Groupe de transfert Stripe pour les paiements connectés
  vendeurStripeId: { 
    type: String, 
    required: true 
  }, // ID du compte Stripe du vendeur
  livreurStripeId: { 
    type: String 
  }, // ID du compte Stripe du livreur (si applicable)
  stripeStatusHistory: [{ // Historique des statuts du paiement Stripe
    status: { type: String }, // Ex: requires_confirmation, succeeded, requires_capture
    event: { type: String }, // Ex: payment_intent.created, payment_intent.succeeded
    date: { type: Date, default: Date.now },
  }],

  // --- Montants & commissions calculés lors de la commande (pour transfert)
  commissionGlobale: { type: Number }, // Commission totale Riveltime (en centimes)
  commissionVendeur: { type: Number }, // Part de la commission supportée par le vendeur (en centimes)
  commissionLivreur: { type: Number }, // Part de la commission supportée par le livreur (en centimes)
  montantVendeur: { type: Number }, // Montant net à transférer au vendeur (en centimes)
  montantLivreur: { type: Number }, // Montant net à transférer au livreur (en centimes)

  // --- Informations figées (snapshot au moment de la commande)
  clientNom: { type: String },
  clientTelephone: { type: String },
  clientAvatarUrl: { type: String },
  boutiqueNom: { type: String },
  boutiqueCoverUrl: { type: String, trim: true },
  boutiqueTelephone: { type: String },

  // --- Détails logistiques calculés
  poidsTotalKg: { type: Number }, // Poids total des produits en kg
  volumeTotalM3: { type: Number }, // Volume total des produits en m³
  poidsFacture: { type: Number }, // Poids facturé pour la livraison
  distanceKm: { type: Number }, // Distance estimée entre boutique et client en km
  vehiculeRecommande: { type: String }, // Type de véhicule recommandé pour la livraison
  estimatedDelayMinutes: { type: Number }, // Délai de livraison estimé en minutes
  estimatedDelayFormatted: { type: String }, // Délai formaté (ex: "30 min", "1h 15min")
  estimatedDeliveryAt: { type: Date }, // **CORRIGÉ : Date et heure estimée de livraison**
  
  // Code de vérification pour la livraison (à donner au livreur)
  codeVerificationClient: { 
    type: String 
  }, 

}, { timestamps: true }); // Ajoute automatiquement createdAt et updatedAt

// Exportation du modèle de commande
const Order = mongoose.model('Order', orderSchema);

export default Order;