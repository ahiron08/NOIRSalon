import { shell, heading, paragraph, detailTable, labelRow, statusBadge, escapeHtml } from '../_shared.js';

/**
 * "Thank You for Visiting" — sent when an admin marks an appointment completed.
 * Only sent AFTER the appointment has been saved as completed in MongoDB.
 * @param {{name:string, service:string, stylist:string, date:string, time:string,
 *          duration?:number, status:string}} ctx
 */
export default function completed(ctx) {
  const text = [
    'NOIR SALON — Thank You for Visiting',
    '',
    `Hello ${ctx.name},`,
    '',
    'Thank you for visiting NOIR Salon. We hope you loved your experience.',
    '',
    `Service: ${ctx.service}`,
    `Stylist: ${ctx.stylist}`,
    `Date: ${ctx.date}`,
    `Time: ${ctx.time}`,
    `Status: ${ctx.status}`,
    '',
    'We look forward to seeing you again.',
  ].join('\n');

  const html = shell({
    title: 'Thank You for Visiting',
    body: [
      heading('Thank You for Visiting'),
      paragraph(`Hello ${escapeHtml(ctx.name)},<br/><br/>Your appointment has been marked <strong style="color:#D4AF37;">completed</strong>. We hope you loved your experience.`),
      detailTable([
        labelRow('Service', escapeHtml(ctx.service)),
        labelRow('Stylist', escapeHtml(ctx.stylist)),
        labelRow('Date', escapeHtml(ctx.date)),
        labelRow('Time', escapeHtml(ctx.time)),
        labelRow('Status', statusBadge(ctx.status)),
      ]),
      paragraph('Your feedback means the world to us. We look forward to seeing you again at NOIR Salon.', '#8a8a8a'),
    ].join(''),
  });

  return { subject: 'NOIR Salon | Thank You for Visiting', text, html };
}
