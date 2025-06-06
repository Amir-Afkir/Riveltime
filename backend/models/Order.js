

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  deliverer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Peut être null au départ
  items: [orderItemSchema],
  totalPrice: { type: Number, required: true },
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
  placedAt: { type: Date, default: Date.now },
}, { timestamps: true });

orderSchema.index({ client: 1 });
orderSchema.index({ seller: 1 });
orderSchema.index({ deliverer: 1 });

module.exports = mongoose.model('Order', orderSchema);