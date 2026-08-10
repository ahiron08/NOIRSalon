import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';
import Coupon from '../models/Coupon.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

/** Resolve the active cart for a user or a guest session. */
async function resolveCart(req) {
  const filter = req.user ? { user: req.user._id } : { sessionId: req.body.sessionId || req.query.sessionId };
  let cart = await Cart.findOne(filter).populate('items.product');
  if (!cart) {
    cart = await Cart.create({
      ...filter,
      isGuest: !req.user,
      items: [],
    });
  }
  return cart;
}

/** Recompute the coupon discount for the current cart contents. */
async function applyCouponToCart(cart, couponCode, userUsed) {
  if (!couponCode) {
    cart.couponCode = undefined;
    cart.couponDiscount = 0;
    return cart;
  }
  const coupon = await Coupon.findOne({ code: couponCode });
  const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  if (!coupon) throw new AppError('Invalid coupon code.', 400);
  const result = coupon.isValid(subtotal, userUsed);
  if (!result.ok) throw new AppError(result.message, 400);

  const discount = coupon.type === 'percent'
    ? Math.min((subtotal * coupon.value) / 100, coupon.maxDiscount || Infinity)
    : coupon.value;

  cart.couponCode = coupon.code;
  cart.couponDiscount = Math.min(discount, subtotal);
  return cart;
}

export const getCart = catchAsync(async (req, res) => {
  const cart = await resolveCart(req);
  res.json({ success: true, data: cart });
});

export const addItem = catchAsync(async (req, res, next) => {
  const { productId, quantity = 1, sessionId } = req.body;
  const product = await Product.findById(productId);
  if (!product) return next(new AppError('Product not found.', 404));
  if (product.stock < quantity) return next(new AppError(`Only ${product.stock} in stock.`, 400));

  const cart = await resolveCart({ user: req.user, body: { sessionId } });
  const existing = cart.items.find((i) => i.product._id.toString() === productId);
  if (existing) existing.quantity = Math.min(existing.quantity + quantity, product.stock);
  else cart.items.push({ product: productId, quantity, price: product.price, name: product.name, image: product.image });

  await applyCouponToCart(cart, cart.couponCode, 0);
  await cart.save();
  res.json({ success: true, data: cart });
});

export const updateQty = catchAsync(async (req, res, next) => {
  const { productId, quantity, sessionId } = req.body;
  const cart = await resolveCart({ user: req.user, body: { sessionId } });
  const item = cart.items.find((i) => i.product._id.toString() === productId);
  if (!item) return next(new AppError('Item not in cart.', 404));
  if (quantity <= 0) cart.items = cart.items.filter((i) => i.product._id.toString() !== productId);
  else item.quantity = quantity;

  await applyCouponToCart(cart, cart.couponCode, 0);
  await cart.save();
  res.json({ success: true, data: cart });
});

export const removeItem = catchAsync(async (req, res, next) => {
  const { productId, sessionId } = req.body;
  const cart = await resolveCart({ user: req.user, body: { sessionId } });
  cart.items = cart.items.filter((i) => i.product._id.toString() !== productId);
  await applyCouponToCart(cart, cart.couponCode, 0);
  await cart.save();
  res.json({ success: true, data: cart });
});

export const applyCoupon = catchAsync(async (req, res) => {
  const { code, sessionId } = req.body;
  const cart = await resolveCart({ user: req.user, body: { sessionId } });
  await applyCouponToCart(cart, code, 0);
  await cart.save();
  res.json({ success: true, data: cart });
});

export const clearCart = catchAsync(async (req, res) => {
  const cart = await resolveCart(req);
  cart.items = [];
  cart.couponCode = undefined;
  cart.couponDiscount = 0;
  await cart.save();
  res.json({ success: true, data: cart });
});
