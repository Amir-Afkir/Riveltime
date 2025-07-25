import mongoose from 'mongoose';

const infosClientSchema = new mongoose.Schema({
  adresseComplete: { type: String, trim: true },
  latitude: Number,
  longitude: Number,
}, { _id: false });

const infosVendeurSchema = new mongoose.Schema({
  adresseComplete: { type: String, trim: true },
  latitude: Number,
  longitude: Number,
  moyensPaiement: [String],
  stripeAccountId: { type: String, trim: true }, // ✅ Ajout ici
}, { _id: false });

const infosLivreurSchema = new mongoose.Schema({
  typeDeTransport: { type: String, trim: true },
  stripeAccountId: { type: String, trim: true }, // ✅ Ajout ici
}, { _id: false });

const userSchema = new mongoose.Schema({
  auth0Id: { type: String, required: true, unique: true },
  stripeCustomerId: { type: String, trim: true }, // ✅ Ajout ici
  email: { type: String, required: true },
  fullname: { type: String, default: 'Utilisateur', trim: true },
  phone: {
    type: String,
    validate: {
      validator: (v) => /^\+?[0-9]{7,15}$/.test(v),
      message: "Numéro de téléphone invalide",
    },
    trim: true,
  },
  avatarUrl: { type: String },
  role: { type: String, enum: ['client', 'vendeur', 'livreur'], default: 'client' },

  infosClient: { type: infosClientSchema, default: () => ({}) },
  infosVendeur: { type: infosVendeurSchema, default: () => ({}) },
  infosLivreur: { type: infosLivreurSchema, default: () => ({}) },

  notifications: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;