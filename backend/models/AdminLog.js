// backend/models/AdminLog.js
import mongoose from 'mongoose';

const adminLogSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  targetModel: { type: String }, // ex: 'User', 'Order', 'Product'
  targetId: { type: mongoose.Schema.Types.ObjectId },
  message: { type: String },
}, { timestamps: true });

adminLogSchema.index({ admin: 1 });

const AdminLog = mongoose.model('AdminLog', adminLogSchema);
export default AdminLog;