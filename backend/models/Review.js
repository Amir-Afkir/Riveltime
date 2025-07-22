import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
}, { timestamps: true });

reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ product: 1 });
reviewSchema.index({ order: 1 });

export default mongoose.model('Review', reviewSchema);
