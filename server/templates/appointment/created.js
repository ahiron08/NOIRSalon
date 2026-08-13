import { shell, heading, paragraph, detailTable, labelRow, statusBadge, escapeHtml } from '../_shared.js';

/**
 * "Reservation Received" — sent when a customer successfully books.
 * @param {{name:string, service:string, stylist:string, date:string, time:string,
 *          duration?:number, status:string, notes?:string}} ctx
 */
export default function created(ctx) {
  const text = [
    'NOIR SALON — Reservation Received',
    '',
    `Hello ${ctx.name},`,
    '',
    "We've received your reservation request.",
    '',
    `Service: ${ctx.service}`,
    `Stylist: ${ctx.stylist}`,
    `Date: ${ctx.date}`,
    `Time: ${ctx.time}`,
    `Duration: ${ctx.duration ? `${ctx.duration} minutes` : '—'}`,
    `Status: ${ctx.status}`,
    ...(ctx.notes ? [`Notes: ${ctx.notes}`] : []),
    '',
    "We'll notify you when your reservation is confirmed.",
  ].join('\n');

  const html = shell({
    title: 'Reservation Received',
    body: [
      heading('Reservation Received'),
      paragraph(`Hello ${escapeHtml(ctx.name)},<br/><br/>We've received your reservation request. Please review the details below.`),
      detailTable([
        labelRow('Service', escapeHtml(ctx.service)),
        labelRow('Stylist', escapeHtml(ctx.stylist)),
        labelRow('Date', escapeHtml(ctx.date)),
        labelRow('Time', escapeHtml(ctx.time)),
        labelRow('Duration', ctx.duration ? `${escapeHtml(String(ctx.duration))} minutes` : '—'),
        labelRow('Status', statusBadge(ctx.status)),
        ...(ctx.notes ? [labelRow('Notes', escapeHtml(ctx.notes))] : []),
      ]),
      paragraph("We'll notify you as soon as your reservation is confirmed. Need help? Reach us by phone or WhatsApp at the salon.", '#8a8a8a'),
    ].join(''),
  });

  return { subject: 'NOIR Salon | Reservation Received', text, html };
}
