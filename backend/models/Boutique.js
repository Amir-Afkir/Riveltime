const mongoose = require('mongoose');

/**
 * Schéma pour la boutique
 */
const boutiqueSchema = new mongoose.Schema({
  /**
   * Nom de la boutique
   * @type {string}
   * @required
   * @minlength 2
   * @maxlength 100
   */
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
    trim: true,
  },

  /**
   * Description facultative de la boutique
   * @type {string}
   * @maxlength 500
   */
  description: {
    type: String,
    maxlength: 500,
    trim: true,
  },

  /**
   * Adresse facultative de la boutique
   * @type {string}
   * @maxlength 200
   */
  address: {
    type: String,
    maxlength: 200,
    trim: true,
  },

  /**
   * Localisation géographique de la boutique (GeoJSON Point)
   * @type {object}
   * @property {string} type - Doit être 'Point'
   * @property {number[]} coordinates - Tableau [longitude, latitude]
   */
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
        validator: function(value) {
          return value.length === 2 &&
            value[0] >= -180 && value[0] <= 180 &&
            value[1] >= -90 && value[1] <= 90;
        },
        message: props => `Coordonnées invalides : ${props.value}`,
      }
    }
  },

  /**
   * URL de l'image de couverture de la boutique (Cloudinary)
   * @type {string}
   */
  coverImageUrl: {
    type: String,
    trim: true,
  },

  /**
   * Public ID Cloudinary de l'image de couverture, pour suppression
   * @type {string}
   */
  coverImagePublicId: {
    type: String,
    trim: true,
  },

  /**
   * Catégorie de la boutique parmi une liste restreinte
   * @type {string}
   * @enum ['Alimentation', 'Mobilité électrique', 'Prêt-à-porter', 'Informatique', 'Restaurant', 'Santé', 'Bricolage', 'Jardin']
   * @required
   */
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

  /**
   * Référence vers l'utilisateur propriétaire (vendeur)
   * @type {ObjectId}
   * @ref User
   * @required
   */
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

}, { timestamps: true });

// Index géospatial 2dsphere pour les requêtes spatiales
boutiqueSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Boutique', boutiqueSchema);