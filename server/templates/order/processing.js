import { shell, heading, paragraph, detailTable, labelRow, statusBadge, escapeHtml } from '../_shared.js';

/**
 * "Your Order Is Being Processed" — sent when an order status changes to 'processing'.
 * @param {{name:string, id:string, total:number, paymentStatus:string, status:string}} ctx
 */
export default function processing(ctx) {
  const text = [
    'NOIR SALON — Your Order Is Being Processed',
    '',
    `Hello ${ctx.name},`,
    '',
    'Good news — your order is now being processed.',
    '',
    `Order ID: #${ctx.id ? String(ctx.id).slice(-8) : ''}`,
    `Order Status: ${ctx.status}`,
    '',
    'You will receive a notification once it is complete.',
  ].join('\n');

  const html = shell({
    title: 'Your Order Is Being Processed',
    body: [
      heading('Your Order Is Being Processed'),
      paragraph(`Hello ${escapeHtml(ctx.name)},<br/><br/>Good news — your order is now being <strong style="color:#D4AF37;">processed</strong>.`),
      detailTable([
        labelRow('Order ID', `#${ctx.id ? escapeHtml(String(ctx.id).slice(-8)) : ''}`),
        labelRow('Status', statusBadge(ctx.status)),
      ]),
      paragraph('You will receive an update as soon as your order is complete.', '#8a8a8a'),
    ].join(''),
  });

  return { subject: 'NOIR Salon | Your Order Is Being Processed', text, html };
}
