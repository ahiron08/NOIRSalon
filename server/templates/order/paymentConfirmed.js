import { shell, heading, paragraph, detailTable, labelRow, statusBadge, money, escapeHtml } from '../_shared.js';

/**
 * "Payment Confirmed" — sent ONLY when payment has actually been verified and the
 * order's paymentStatus has transitioned to 'paid' (never on QR generation).
 * @param {{name:string, id:string, total:number, paymentStatus:string}} ctx
 */
export default function paymentConfirmed(ctx) {
  const text = [
    'NOIR SALON — Payment Confirmed',
    '',
    `Hello ${ctx.name},`,
    '',
    'Your payment has been confirmed.',
    '',
    `Order ID: #${ctx.id ? String(ctx.id).slice(-8) : ''}`,
    `Amount Paid: ${money(ctx.total)}`,
    `Payment Status: ${ctx.paymentStatus}`,
    '',
    'Thank you for your purchase.',
  ].join('\n');

  const html = shell({
    title: 'Payment Confirmed',
    body: [
      heading('Payment Confirmed'),
      paragraph(`Hello ${escapeHtml(ctx.name)},<br/><br/>Your payment has been <strong style="color:#D4AF37;">confirmed</strong>. Thank you for your purchase.`),
      detailTable([
        labelRow('Order ID', `#${ctx.id ? escapeHtml(String(ctx.id).slice(-8)) : ''}`),
        labelRow('Amount Paid', money(ctx.total)),
        labelRow('Payment Status', statusBadge(ctx.paymentStatus)),
      ]),
      paragraph('If you have any questions, feel free to reach out to the salon.', '#8a8a8a'),
    ].join(''),
  });

  return { subject: 'NOIR Salon | Payment Confirmed', text, html };
}
