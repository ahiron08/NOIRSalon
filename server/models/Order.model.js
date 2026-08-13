import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    image: String,
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    phone: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guestEmail: String,
    guestPhone: String,
    // Guest orders are scoped by the checkout session so the same guest can
    // retrieve their own payment info without being able to fetch others'.
    sessionId: String,

    items: [orderItemSchema],

    subtotal: { type: Number, required: true, min: 0 },
    couponCode: String,
    couponDiscount: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true, min: 0 },

    shippingAddress: shippingAddressSchema,

    paymentMethod: {
      type: String,
      enum: ['cash', 'razorpay', 'stripe', 'giftcard', 'upi'],
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentRef: String,
    // Historical UPI payment string (server built) used / re-renderable as a QR
    // against the server-calculated `total`. Never editable by the client.
    upiString: String,
    paidAt: Date,

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    deliveredAt: Date,
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, status: 1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
