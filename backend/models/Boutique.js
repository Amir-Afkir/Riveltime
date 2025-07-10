const mongoose = require('mongoose');

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
      'Mobilité électrique',
      'Prêt-à-porter',
      'Informatique',
      'Restaurant',
      'Santé',
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

}, { timestamps: true });

// Index géospatial 2dsphere pour les requêtes spatiales
boutiqueSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Boutique', boutiqueSchema);