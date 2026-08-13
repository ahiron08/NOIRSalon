import { shell, heading, paragraph, detailTable, labelRow, statusBadge, escapeHtml } from '../_shared.js';

/**
 * "Your Order Has Been Cancelled" — sent when an order status changes to 'cancelled'.
 * @param {{name:string, id:string, total:number, paymentStatus:string, status:string}} ctx
 */
export default function cancelled(ctx) {
  const text = [
    'NOIR SALON — Your Order Has Been Cancelled',
    '',
    `Hello ${ctx.name},`,
    '',
    'Your order has been cancelled.',
    '',
    `Order ID: #${ctx.id ? String(ctx.id).slice(-8) : ''}`,
    `Order Status: ${ctx.status}`,
    '',
    'If you have any questions, please contact the salon.',
  ].join('\n');

  const html = shell({
    title: 'Your Order Has Been Cancelled',
    body: [
      heading('Your Order Has Been Cancelled'),
      paragraph(`Hello ${escapeHtml(ctx.name)},<br/><br/>Your order has been <strong style="color:#b91c1c;">cancelled</strong>.`),
      detailTable([
        labelRow('Order ID', `#${ctx.id ? escapeHtml(String(ctx.id).slice(-8)) : ''}`),
        labelRow('Order Status', statusBadge(ctx.status)),
      ]),
      paragraph('If you have any questions, please contact the salon.', '#8a8a8a'),
    ].join(''),
  });

  return { subject: 'NOIR Salon | Your Order Has Been Cancelled', text, html };
}
