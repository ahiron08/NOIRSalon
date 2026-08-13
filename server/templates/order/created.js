import { shell, heading, paragraph, detailTable, labelRow, statusBadge, itemsTable, itemRow, money, escapeHtml } from '../_shared.js';

/**
 * "Order Received" — sent when an order is placed.
 * @param {{name:string, id:string, items:Array<{name:string, qty:number, price:number}>,
 *          subtotal:number, couponCode?:string, couponDiscount?:number, deliveryFee?:number,
 *          tax?:number, total:number, paymentStatus:string, status:string}} ctx
 */
export default function created(ctx) {
  const itemRows = (ctx.items || []).map((it) =>
    itemRow({ name: it.name, qty: it.qty, lineTotal: (it.price || 0) * (it.qty || 1) })
  );

  const summaryRows = [
    labelRow('Subtotal', money(ctx.subtotal)),
    ...(ctx.couponDiscount ? [labelRow(`Coupon (${ctx.couponCode || ''})`, `−${money(ctx.couponDiscount)}`)] : []),
    ...(ctx.deliveryFee ? [labelRow('Delivery', money(ctx.deliveryFee))] : []),
    ...(ctx.tax ? [labelRow('GST (5%)', money(ctx.tax))] : []),
    `<tr><td style="padding:9px 0 0;border-top:1px solid #2a2a2a;font-size:13px;color:#fafafa;">Total</td><td style="padding:9px 0 0;border-top:1px solid #2a2a2a;font-size:16px;color:#D4AF37;text-align:right;font-weight:700;">${money(ctx.total)}</td></tr>`,
  ];

  const text = [
    'NOIR SALON — Order Received',
    '',
    `Hello ${ctx.name},`,
    '',
    'Thank you for your order.',
    '',
    `Order ID: #${ctx.id ? String(ctx.id).slice(-8) : ''}`,
    '',
    ...(ctx.items || []).map((it) => `${it.name} × ${it.qty} — ${money((it.price || 0) * (it.qty || 1))}`),
    '',
    `Subtotal: ${money(ctx.subtotal)}`,
    ...(ctx.couponDiscount ? [`Coupon (${ctx.couponCode || ''}): −${money(ctx.couponDiscount)}`] : []),
    ...(ctx.deliveryFee ? [`Delivery: ${money(ctx.deliveryFee)}`] : []),
    ...(ctx.tax ? [`GST (5%): ${money(ctx.tax)}`] : []),
    `Total: ${money(ctx.total)}`,
    '',
    `Payment: ${ctx.paymentStatus}`,
    `Status: ${ctx.status}`,
    '',
    'We will keep you updated as your order progresses.',
  ].join('\n');

  const html = shell({
    title: 'Order Received',
    body: [
      heading('Order Received'),
      paragraph(`Hello ${escapeHtml(ctx.name)},<br/><br/>Thank you for your order. It has been received and is being looked after.`),
      paragraph(`Order ID: <strong style="color:#fafafa;">#${ctx.id ? escapeHtml(String(ctx.id).slice(-8)) : ''}</strong>`, '#8a8a8a'),
      itemsTable(itemRows),
      detailTable(summaryRows),
      detailTable([
        labelRow('Payment', statusBadge(ctx.paymentStatus)),
        labelRow('Order Status', statusBadge(ctx.status)),
      ]),
      paragraph('We will email you as your order progresses.', '#8a8a8a'),
    ].join(''),
  });

  return { subject: 'NOIR Salon | Order Received', text, html };
}
