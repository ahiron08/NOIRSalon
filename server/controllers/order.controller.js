import Order from '../models/Order.model.js';
import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';
import Coupon from '../models/Coupon.model.js';
import GiftCard from '../models/GiftCard.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import APIFeatures from '../utils/apiFeatures.js';
import payment from '../services/payment.service.js';
import { sendEmail, layout } from '../services/email.service.js';

const TAX_RATE = 0.05; // 5% GST placeholder — configurable per setting later
const DELIVERY_FEE = 99;

/** Convert a cart into an order with full price computation. */
export const createOrder = catchAsync(async (req, res, next) => {
  const { address, paymentMethod = 'cash', sessionId, giftCardCode } = req.body;

  const cart = await Cart.findOne(req.user ? { user: req.user._id } : { sessionId }).populate('items.product');
  if (!cart || !cart.items.length) return next(new AppError('Your cart is empty.', 400));

  const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const couponDiscount = cart.couponDiscount || 0;
  const taxable = Math.max(0, subtotal - couponDiscount);
  const tax = Math.round(taxable * TAX_RATE);

  // gift card payment → validate & reduce balance
  let giftCard;
  if (paymentMethod === 'giftcard') {
    giftCard = await GiftCard.findOne({ code: giftCardCode, active: true });
    if (!giftCard || giftCard.balance <= 0) return next(new AppError('Gift card is invalid or has no balance.', 400));
  }

  const total = taxable + tax + DELIVERY_FEE - (giftCard ? Math.min(giftCard.balance, taxable + tax + DELIVERY_FEE) : 0);

  const order = await Order.create({
    user: req.user?._id,
    guestEmail: req.user ? undefined : (req.body.email || 'guest@noir.local'),
    guestPhone: req.body.phone,
    items: cart.items.map((i) => ({
      product: i.product._id,
      name: i.product.name,
      image: i.product.image,
      quantity: i.quantity,
      price: i.price,
    })),
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
  const sessions = cart.items.map((i) => Product.updateOne({ _id: i.product._id }, { $inc: { stock: -i.quantity } }));
  await Promise.all(sessions);

  // create payment intent via the abstract layer
  const intent = await payment.createIntent({ order, amount: total, customer: req.user?.email || req.body.email });
  if (paymentMethod === 'giftcard' && giftCard) {
    giftCard.balance = Math.max(0, giftCard.balance - total);
    giftCard.isRedeemed = giftCard.balance <= 0;
    giftCard.usedCount += 1;
    await giftCard.save();
  }
  if (paymentMethod === 'cash' || paymentMethod === 'giftcard') {
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

  const email = req.user?.email || req.body.email;
  if (email) {
    sendEmail({
      to: email,
      subject: 'Order confirmed — NOIR SALON',
      html: layout(
        `<p style="font-size:15px;color:#fff;">Thank you. Your order <strong>#${order._id}</strong> of <strong>₹${total}</strong> has been placed.</p>`,
        'Order confirmed'
      ),
    }).catch(() => {});
  }

  res.status(201).json({ success: true, intent, data: order });
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
  const allowed = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!allowed.includes(req.body.status)) return next(new AppError('Invalid status.', 400));
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  if (!order) return next(new AppError('Order not found.', 404));
  res.json({ success: true, data: order });
});
