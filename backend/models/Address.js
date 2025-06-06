// backend/models/Address.js
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  label: { type: String, default: 'Domicile' },
  fullAddress: { type: String, required: true },
  location: {
    lat: Number,
    lng: Number
  },
}, { timestamps: true });

addressSchema.index({ user: 1 });

module.exports = mongoose.model('Address', addressSchema);