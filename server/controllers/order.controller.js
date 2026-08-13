import mongoose from 'mongoose';
import Order from '../models/Order.model.js';
import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';
import Coupon from '../models/Coupon.model.js';
import GiftCard from '../models/GiftCard.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import APIFeatures from '../utils/apiFeatures.js';
import payment from '../services/payment.service.js';
import { generatePaymentQR } from '../services/qr.service.js';
import {
  sendOrderCreatedEmail,
  sendOrderPaymentConfirmedEmail,
  sendOrderProcessingEmail,
  sendOrderCompletedEmail,
  sendOrderCancelledEmail,
} from '../services/email.service.js';

const TAX_RATE = 0.05; // 5% GST placeholder — configurable per setting later
const DELIVERY_FEE = 99;

/** Convert a cart into an order with authoritative server-side pricing. */
export const createOrder = catchAsync(async (req, res, next) => {
  const { address, paymentMethod = 'cash', sessionId, giftCardCode } = req.body;

  const cart = await Cart.findOne(req.user ? { user: req.user._id } : { sessionId }).populate('items.product');
  if (!cart || !cart.items.length) return next(new AppError('Your cart is empty.', 400));

  // ---- authoritative pricing: read the CURRENT Mongo price for every line ----
  // The client/cart snapshot price is never trusted.
  const lineItems = [];
  for (const item of cart.items) {
    const productId = item.product?._id || item.product;
    if (!mongoose.isValidObjectId(productId)) return next(new AppError('Invalid product in cart.', 400));
    const product = await Product.findOne({ _id: productId, active: true });
    if (!product) return next(new AppError('A product in your cart is no longer available.', 400));
    if (product.stock < item.quantity) {
      return next(new AppError(`Only ${product.stock} of "${product.name}" available.`, 400));
    }
    lineItems.push({
      product: product._id,
      name: product.name,
      image: product.image,
      quantity: item.quantity,
      price: product.price, // authoritative Mongo value
    });
  }

  const subtotal = lineItems.reduce((s, i) => s + i.price * i.quantity, 0);

  // gift card payment → validate & reduce balance
  let giftCard;
  if (paymentMethod === 'giftcard') {
    giftCard = await GiftCard.findOne({ code: giftCardCode, active: true });
    if (!giftCard || giftCard.balance <= 0) return next(new AppError('Gift card is invalid or has no balance.', 400));
  }

  const couponDiscount = Math.min(cart.couponDiscount || 0, subtotal);
  const taxable = Math.max(0, subtotal - couponDiscount);
  const tax = Math.round(taxable * TAX_RATE);
  const total = taxable + tax + DELIVERY_FEE - (giftCard ? Math.min(giftCard.balance, taxable + tax + DELIVERY_FEE) : 0);

  const order = await Order.create({
    user: req.user?._id,
    sessionId: req.user ? undefined : sessionId,
    guestEmail: req.user ? undefined : (req.body.email || 'guest@noir.local'),
    guestPhone: req.body.phone,
    items: lineItems,
    subtotal,
    couponCode: cart.couponCode,
    couponDiscount,
    deliveryFee: DELIVERY_FEE,
    tax,
    total,
    shippingAddress: address,
    paymentMethod,
  });

  // reduce stock atomically
  await Promise.all(
    lineItems.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: -i.quantity } }))
  );

  // payment intent (abstract gateway layer) + provider-specific capture below
  const intent = await payment.createIntent({
    order,
    amount: total,
    customer: req.user?.email || req.body.email,
  });

  let paymentInfo = null;
  if (paymentMethod === 'upi') {
    // Order intentionally stays `pending`. A QR is generated ONLY from the
    // server-calculated `total`; generating a QR never marks the order paid.
    const qr = await generatePaymentQR({ amount: total, orderId: order._id.toString() });
    order.upiString = qr.upiString;
    await order.save();
    paymentInfo = { provider: 'upi', paymentStatus: 'pending', ...qr };
  } else if (paymentMethod === 'cash' || paymentMethod === 'giftcard') {
    if (giftCard) {
      giftCard.balance = Math.max(0, giftCard.balance - total);
      giftCard.isRedeemed = giftCard.balance <= 0;
      giftCard.usedCount += 1;
      await giftCard.save();
    }
    order.paymentStatus = 'paid';
    order.paidAt = new Date();
    order.paymentRef = giftCard?.code || 'COD';
    await order.save();
  }

  // persist coupon usage
  if (cart.couponCode) await Coupon.updateOne({ code: cart.couponCode }, { $inc: { usedCount: 1 } });

  // clear the cart
  cart.items = [];
  cart.couponCode = undefined;
  cart.couponDiscount = 0;
  await cart.save();

  // Send "Order Received" to the persisted customer email. Fire-and-forget: a
  // delivery failure is logged by the email service and never affects the order
  // that has already been saved successfully.
  sendOrderCreatedEmail({ ...order.toObject(), user: req.user || null });

  res.status(201).json({ success: true, intent, payment: paymentInfo, data: order });
});

/** Resolve a single order and scope it to the requester (user or guest session). */
async function resolveOwnedOrder(req, next) {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError('Order not found.', 404));
  if (req.user) {
    if (!order.user || order.user.toString() !== req.user._id.toString()) {
      return next(new AppError('Order not found.', 403));
    }
  } else {
    if (!order.sessionId || order.sessionId !== (req.query.sessionId || req.body.sessionId)) {
      return next(new AppError('Order not found.', 403));
    }
  }
  return order;
}

/** A signed-in customer's single order (scoped — 404 hides others' orders). */
export const getMyOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return next(new AppError('Order not found.', 404));
  res.json({ success: true, data: order });
});

/**
 * Payment / QR info for an order. The QR and its amount are derived server-side
 * from the stored order `total` — the client can never set the QR amount.
 */
export const getPaymentInfo = catchAsync(async (req, res, next) => {
  const order = await resolveOwnedOrder(req, next);
  if (!order) return;
  const qr = await generatePaymentQR({ amount: order.total, orderId: order._id.toString() });
  res.json({
    success: true,
    data: {
      orderId: order._id,
      total: order.total,
      currency: 'INR',
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      paidAt: order.paidAt,
      upiString: order.upiString || qr.upiString,
      qrDataUrl: qr.dataUrl,
    },
  });
});

/**
 * Check payment status. UPI is not auto-verified in this deployment, so this
 * returns the CURRENT persisted status — it never assumes a QR was paid.
 */
export const checkPaymentStatus = catchAsync(async (req, res, next) => {
  const order = await resolveOwnedOrder(req, next);
  if (!order) return;
  res.json({
    success: true,
    data: {
      orderId: order._id,
      orderStatus: order.status,
      paymentStatus: order.paymentStatus,
      paid: order.paymentStatus === 'paid',
      paidAt: order.paidAt,
      method: order.paymentMethod,
    },
  });
});

/** Admin: mark/verify the transaction / payment status (authoritative). */
export const markPaymentStatus = catchAsync(async (req, res, next) => {
  const { paymentStatus } = req.body;
  const allowed = ['pending', 'paid', 'failed', 'refunded'];
  if (!allowed.includes(paymentStatus)) return next(new AppError('Invalid payment status.', 400));

  const existing = await Order.findById(req.params.id).populate('user', 'name email');
  if (!existing) return next(new AppError('Order not found.', 404));

  // Duplicate-email prevention: re-saving the same payment status sends nothing.
  if (existing.paymentStatus === paymentStatus) {
    return res.json({ success: true, data: existing, unchanged: true });
  }

  const update = { paymentStatus };
  if (paymentStatus === 'paid') {
    update.paidAt = new Date();
  }
  const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).populate(
    'user',
    'name email'
  );
  if (!order) return next(new AppError('Order not found.', 404));

  // Payment Confirmed is sent ONLY when payment has actually been recorded as
  // paid by the backend — never on QR generation. Fire-and-forget as always.
  if (paymentStatus === 'paid') {
    sendOrderPaymentConfirmedEmail(order);
  }

  res.json({ success: true, data: order });
});

/** Current user's orders. */
export const myOrders = catchAsync(async (req, res) => {
  const data = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json({ success: true, count: data.length, data });
});

/** Admin: all orders with features. */
export const getAllOrders = catchAsync(async (req, res) => {
  const features = new APIFeatures(Order.find().populate('user', 'name email'), req.query)
    .search(['guestEmail', 'guestPhone'])
    .filter()
    .sort()
    .paginate();
  const [data, meta] = await Promise.all([features.query, features.countTotal()]);
  res.json({ success: true, count: data.length, data, pagination: meta });
});

export const getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone').populate('items.product', 'name image');
  if (!order) return next(new AppError('Order not found.', 404));
  res.json({ success: true, data: order });
});

export const updateStatus = catchAsync(async (req, res, next) => {
  // The admin UI exposes "completed"; the order schema's terminal state is
  // "delivered", so normalise the alias before validating/persisting.
  const newStatus = req.body.status === 'completed' ? 'delivered' : req.body.status;
  const allowed = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!allowed.includes(newStatus)) return next(new AppError('Invalid status.', 400));

  const existing = await Order.findById(req.params.id).populate('user', 'name email');
  if (!existing) return next(new AppError('Order not found.', 404));

  // Duplicate-email prevention: re-saving the same status sends nothing.
  if (existing.status === newStatus) {
    return res.json({ success: true, data: existing, unchanged: true });
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: newStatus },
    { new: true, runValidators: true }
  ).populate('user', 'name email');
  if (!order) return next(new AppError('Order not found.', 404));

  // Notify only on real transitions; recipient is the persisted order email.
  if (newStatus === 'processing') {
    sendOrderProcessingEmail(order);
  } else if (newStatus === 'delivered') {
    sendOrderCompletedEmail(order);
  } else if (newStatus === 'cancelled') {
    sendOrderCancelledEmail(order);
  }

  res.json({ success: true, data: order });
});
