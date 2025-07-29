import mongoose from 'mongoose';

/**
 * Schéma pour la boutique
 */
const boutiqueSchema = new mongoose.Schema({

  // ───── Informations générales ─────
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
    trim: true,
  },
  description: {
    type: String,
    maxlength: 500,
    trim: true,
  },
  address: {
    type: String,
    maxlength: 200,
    trim: true,
  },

  // ───── Localisation (GeoJSON) ─────
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0],
      required: true,
      validate: {
        validator: function (value) {
          return value.length === 2 &&
            value[0] >= -180 && value[0] <= 180 &&
            value[1] >= -90 && value[1] <= 90;
        },
        message: props => `Coordonnées invalides : ${props.value}`,
      },
    },
  },

  // ───── Image de couverture ─────
  coverImageUrl: {
    type: String,
    trim: true,
  },
  coverImagePublicId: {
    type: String,
    trim: true,
  },

  // ───── Catégorie ─────
  category: {
    type: String,
    required: true,
    enum: [
      'Alimentation',
      'Restaurant',
      'Santé',
      'Mobilité',
      'Prêt-à-porter',
      'Informatique',
      'Bricolage',
      'Jardin',
    ],
    trim: true,
  },

  // ───── Référence utilisateur ─────
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // ───── Disponibilité ─────
  activerHoraires: {
    type: Boolean,
    default: false,
  },
  horaires: {
    type: Map,
    of: {
      ouvert: { type: Boolean, default: false },
      debut: { type: String }, // format HH:mm
      fin: { type: String },
    },
    default: {},
  },
  fermetureExceptionnelle: {
    type: Boolean,
    default: false,
  },

  // ───── Participation livraison ─────
  activerParticipation: {
    type: Boolean,
    default: false,
  },
  participationPourcent: {
    type: Number,
    enum: [25, 50, 75, 100],
    default: 50,
  },
  contributionLivraisonPourcent: {
    type: Number,
    min: 0,
    max: 100,
    default: 20,
  },

}, { timestamps: true });

// Index géospatial 2dsphere pour les requêtes spatiales
boutiqueSchema.index({ location: '2dsphere' });

const Boutique = mongoose.model('Boutique', boutiqueSchema);
export default Boutique;