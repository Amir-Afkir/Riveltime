// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true },
  phone: { type: String },
  role: {
    type: String,
    enum: ['client', 'merchant', 'deliverer', 'admin'],
    default: 'client',
  },
  isActive: { type: Boolean, default: true },
  avatarUrl: { type: String },
}, { timestamps: true });

userSchema.index({ email: 1 }); // pour recherche rapide

module.exports = mongoose.model('User', userSchema);