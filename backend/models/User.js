const mongoose = require('mongoose');

const infosClientSchema = new mongoose.Schema({
  adresseComplete: String,
  latitude: Number,
  longitude: Number,
}, { _id: false });

const infosVendeurSchema = new mongoose.Schema({
  categorie: String,
  adresseComplete: String,
  latitude: Number,
  longitude: Number,
  moyensPaiement: [String],
}, { _id: false });

const infosLivreurSchema = new mongoose.Schema({
  siret: String,
  zone: String,
  typeDeTransport: String,
}, { _id: false });

const userSchema = new mongoose.Schema({
  auth0Id: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  fullname: { type: String, default: 'Utilisateur' },
  phone: { type: String },
  avatarUrl: { type: String },
  raisonSociale: String,
  kbis: String,
  role: { type: String, enum: ['client', 'vendeur', 'livreur'], default: 'client' },

  infosClient: { type: infosClientSchema, default: null },
  infosVendeur: { type: infosVendeurSchema, default: null },
  infosLivreur: { type: infosLivreurSchema, default: null },

  notifications: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);