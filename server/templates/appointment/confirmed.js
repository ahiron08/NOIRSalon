import { shell, heading, paragraph, detailTable, labelRow, statusBadge, escapeHtml } from '../_shared.js';

/**
 * "Reservation Confirmed" — sent when an admin confirms an appointment.
 * Only sent AFTER the status has actually been saved as confirmed in MongoDB.
 * @param {{name:string, service:string, stylist:string, date:string, time:string,
 *          duration?:number, status:string}} ctx
 */
export default function confirmed(ctx) {
  const text = [
    'NOIR SALON — Reservation Confirmed',
    '',
    `Hello ${ctx.name},`,
    '',
    'Great news — your reservation has been confirmed.',
    '',
    `Service: ${ctx.service}`,
    `Stylist: ${ctx.stylist}`,
    `Date: ${ctx.date}`,
    `Time: ${ctx.time}`,
    `Duration: ${ctx.duration ? `${ctx.duration} minutes` : '—'}`,
    `Status: ${ctx.status}`,
    '',
    'We look forward to welcoming you.',
  ].join('\n');

  const html = shell({
    title: 'Reservation Confirmed',
    body: [
      heading('Reservation Confirmed'),
      paragraph(`Hello ${escapeHtml(ctx.name)},<br/><br/>Great news — your reservation has been <strong style="color:#D4AF37;">confirmed</strong>. Here are the final details:`),
      detailTable([
        labelRow('Service', escapeHtml(ctx.service)),
        labelRow('Stylist', escapeHtml(ctx.stylist)),
        labelRow('Date', escapeHtml(ctx.date)),
        labelRow('Time', escapeHtml(ctx.time)),
        labelRow('Duration', ctx.duration ? `${escapeHtml(String(ctx.duration))} minutes` : '—'),
        labelRow('Status', statusBadge(ctx.status)),
      ]),
      paragraph('We look forward to welcoming you at NOIR Salon. If your plans change, please let us know in advance.', '#8a8a8a'),
    ].join(''),
  });

  return { subject: 'NOIR Salon | Reservation Confirmed', text, html };
}
