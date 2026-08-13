import { shell, heading, paragraph, detailTable, labelRow, statusBadge, escapeHtml } from '../_shared.js';

/**
 * "Reservation Cancelled" — sent when an appointment is cancelled.
 * Only sent AFTER the cancellation has been saved in MongoDB.
 * @param {{name:string, service:string, stylist:string, date:string, time:string,
 *          duration?:number, status:string, cancelReason?:string}} ctx
 */
export default function cancelled(ctx) {
  const text = [
    'NOIR SALON — Reservation Cancelled',
    '',
    `Hello ${ctx.name},`,
    '',
    'Your reservation has been cancelled.',
    '',
    `Service: ${ctx.service}`,
    `Stylist: ${ctx.stylist}`,
    `Date: ${ctx.date}`,
    `Time: ${ctx.time}`,
    `Status: ${ctx.status}`,
    ...(ctx.cancelReason ? [`Reason: ${ctx.cancelReason}`] : []),
    '',
    'We hope to welcome you another time.',
  ].join('\n');

  const html = shell({
    title: 'Reservation Cancelled',
    body: [
      heading('Reservation Cancelled'),
      paragraph(`Hello ${escapeHtml(ctx.name)},<br/><br/>Your reservation has been <strong style="color:#b91c1c;">cancelled</strong>.`),
      detailTable([
        labelRow('Service', escapeHtml(ctx.service)),
        labelRow('Stylist', escapeHtml(ctx.stylist)),
        labelRow('Date', escapeHtml(ctx.date)),
        labelRow('Time', escapeHtml(ctx.time)),
        labelRow('Status', statusBadge(ctx.status)),
        ...(ctx.cancelReason ? [labelRow('Reason', escapeHtml(ctx.cancelReason))] : []),
      ]),
      paragraph('We hope to welcome you back soon. To book a new appointment, visit our website.', '#8a8a8a'),
    ].join(''),
  });

  return { subject: 'NOIR Salon | Reservation Cancelled', text, html };
}
