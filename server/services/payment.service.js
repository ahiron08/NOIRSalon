import { config } from '../config/index.js';

/**
 * Abstract payment gateway layer.
 *
 * The client never talks to a gateway directly — it always hits
 * /orders and this service decides the provider. Swap or add providers
 * without touching controllers. No API keys are ever hardcoded.
 *
 * Implemented providers: cash, giftcard (native), razorpay & stripe (stubs
 * that return a ready-to-complete intent when credentials exist).
 */
export class PaymentService {
  constructor(provider = config.payment.provider) {
    this.provider = provider;
  }

  /**
   * Create a payment intent for an order.
   * @returns {{provider, status, clientSecret?, reference?}}
   */
  async createIntent({ order, amount, currency = 'INR', customer }) {
    switch (this.provider) {
      case 'razorpay':
        return this.#razorpay(order, amount, currency, customer);
      case 'stripe':
        return this.#stripe(order, amount, currency, customer);
      case 'giftcard':
        return { provider: 'giftcard', status: 'pending_capture', reference: null };
      case 'cash':
      default:
        return { provider: 'cash', status: 'cash_on_delivery', reference: null, clientSecret: null };
    }
  }

  async capture({ provider, reference }) {
    // Hook point for gateway capture/verification.
    return { provider, status: 'paid', reference };
  }

  /* ---- private provider implementations ---- */

  async #razorpay(_order, amount, currency, customer) {
    if (!config.payment.razorpayKeyId) {
      return { provider: 'razorpay', status: 'requires_client', clientSecret: null, keyId: null };
    }
    // Production would call Razorpay's Orders API here and return order_id.
    return {
      provider: 'razorpay',
      status: 'requires_client',
      keyId: config.payment.razorpayKeyId,
      amount,
      currency,
      customer,
    };
  }

  async #stripe(_order, amount, currency, _customer) {
    if (!config.payment.stripeSecretKey) {
      return { provider: 'stripe', status: 'requires_client', clientSecret: null };
    }
    // Production would call Stripe's PaymentIntents API here.
    return { provider: 'stripe', status: 'requires_client', amount, currency };
  }
}

export const payment = new PaymentService(config.payment.provider);
export default payment;
