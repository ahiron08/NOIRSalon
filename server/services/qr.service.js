import { config } from '../config/index.js';

/**
 * Build a standards-compliant UPI deep-link string for the FINAL payable amount.
 *
 * The amount passed here always originates on the server (an order's
 * server-calculated `total`) — never from the client — so no one can tamper
 * with what is encoded into the QR.
 */
export function buildUpiString({ upiId, businessName, amount, orderId, merchantId, currency }) {
  const params = new URLSearchParams();
  params.set('pa', upiId || '');
  params.set('pn', businessName || 'NOIR SALON');
  if (merchantId) params.set('tr', merchantId);
  params.set('am', Number(amount).toFixed(2));
  params.set('cu', currency || 'INR');
  if (orderId) params.set('tn', orderId);
  return `upi://pay?${params.toString()}`;
}

/**
 * Generate the payment QR for a server-calculated amount.
 * @returns {{ upiString: string, dataUrl: string|null, amount: number }}
 */
export async function generatePaymentQR({ amount, orderId }) {
  const { upi } = config.payment;
  const upiString = buildUpiString({
    upiId: upi.id,
    businessName: upi.businessName,
    merchantId: upi.merchantId,
    currency: upi.currency,
    amount,
    orderId,
  });

  let dataUrl = null;
  try {
    // `qrcode` is a separate dependency (installed at the repo root via
    // `npm install qrcode -w server`). If it is missing the UPI string is still
    // returned so the order flow keeps working and the UI can degrade gracefully.
    const QRCode = (await import('qrcode')).default;
    dataUrl = await QRCode.toDataURL(upiString, {
      width: 260,
      margin: 1,
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.warn('[qr] QR rendering unavailable — qrcode not installed?', err?.message || err);
  }

  return { upiString, dataUrl, amount: Number(amount) };
}

export default generatePaymentQR;