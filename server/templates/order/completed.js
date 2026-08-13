import { shell, heading, paragraph, detailTable, labelRow, statusBadge, money, escapeHtml } from '../_shared.js';

/**
 * "Your Order Is Complete" — sent when an order status changes to 'delivered'
 * (the schema's terminal state; the admin UI labels it "completed").
 * @param {{name:string, id:string, total:number, paymentStatus:string, status:string}} ctx
 */
export default function completed(ctx) {
  const text = [
    'NOIR SALON — Your Order Is Complete',
    '',
    `Hello ${ctx.name},`,
    '',
    'Your order is complete.',
    '',
    `Order ID: #${ctx.id ? String(ctx.id).slice(-8) : ''}`,
    `Order Total: ${money(ctx.total)}`,
    `Payment Status: ${ctx.paymentStatus}`,
    `Order Status: ${ctx.status}`,
    '',
    'Thank you for shopping with NOIR Salon.',
  ].join('\n');

  const html = shell({
    title: 'Your Order Is Complete',
    body: [
      heading('Your Order Is Complete'),
      paragraph(`Hello ${escapeHtml(ctx.name)},<br/><br/>Your order is now <strong style="color:#D4AF37;">complete</strong>. Thank you for shopping with NOIR Salon.`),
      detailTable([
        labelRow('Order ID', `#${ctx.id ? escapeHtml(String(ctx.id).slice(-8)) : ''}`),
        labelRow('Order Total', money(ctx.total)),
        labelRow('Payment Status', statusBadge(ctx.paymentStatus)),
        labelRow('Order Status', statusBadge(ctx.status)),
      ]),
      paragraph('If you have any questions, feel free to reach out to the salon.', '#8a8a8a'),
    ].join(''),
  });

  return { subject: 'NOIR Salon | Your Order Is Complete', text, html };
}
