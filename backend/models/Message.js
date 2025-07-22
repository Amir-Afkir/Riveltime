
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // facultatif : lié à une commande
}, { timestamps: true });

messageSchema.index({ sender: 1 });
messageSchema.index({ receiver: 1 });
messageSchema.index({ order: 1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;