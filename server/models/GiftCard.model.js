import mongoose from 'mongoose';

const giftCardSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, uppercase: true, trim: true },
    amount: { type: Number, required: true, min: 1 },
    balance: { type: Number, required: true, min: 0 },
    buyerName: String,
    buyerEmail: String,
    recipientName: String,
    recipientEmail: String,
    message: String,
    design: String,
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    isRedeemed: { type: Boolean, default: false },
    usedCount: { type: Number, default: 0 },
    expiresAt: Date,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const GiftCard = mongoose.model('GiftCard', giftCardSchema);
export default GiftCard;
