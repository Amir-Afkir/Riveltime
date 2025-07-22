

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['order_update', 'message', 'promotion', 'system'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String },
  isRead: { type: Boolean, default: false },
  relatedOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
}, { timestamps: true });

notificationSchema.index({ user: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;