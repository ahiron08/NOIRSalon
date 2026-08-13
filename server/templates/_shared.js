/**
 * Shared email-safe HTML helpers for NOIR SALON transactional mail.
 *
 * Everything here uses INLINE styles only (no external CSS files) because most
 * email clients strip <style> blocks and external stylesheets. The visual
 * language mirrors the website: dark background, subtle gold accents, clean
 * typography, minimal layout.
 */

/** Escape user-supplied strings so they cannot break the email HTML. */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Format a number as Indian Rupees with en-IN grouping. */
export function money(value) {
  const n = Number(value || 0);
  return `₹${n.toLocaleString('en-IN')}`;
}

/**
 * Brand shell. Returns the complete <html> document. `body` is the inner,
 * already-HTML content that sits between the header and the footer.
 */
export function shell({ title = 'NOIR SALON', body = '' } = {}) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#0a0a0a;color:#fafafa;font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#111111;border:1px solid #2a2a2a;">
            <tr>
              <td align="center" style="padding:30px 24px 6px;">
                <div style="letter-spacing:0.45em;font-size:20px;color:#D4AF37;font-weight:700;">NOIR</div>
                <div style="letter-spacing:0.35em;font-size:11px;color:#8a8a8a;margin-top:4px;">SALON</div>
                <div style="height:1px;background:#D4AF37;margin:18px auto 0;width:56px;"></div>
              </td>
            </tr>
            <tr>
              <td style="padding:6px 32px 0;">
                ${body}
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:0 24px 26px;">
                <div style="height:1px;background:#2a2a2a;margin:0 0 22px;"></div>
                <div style="font-size:11px;color:#8a8a8a;line-height:1.9;">
                  NOIR SALON — East India's Largest Luxury Salon<br />
                  Guwahati, Assam
                </div>
                <div style="font-size:10px;color:#5a5a5a;margin-top:8px;">
                  © ${new Date().getFullYear()} NOIR Salon. All rights reserved.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Page heading inside the email body. */
export function heading(text) {
  return `<h1 style="margin:18px 0 16px;font-size:22px;color:#fafafa;font-weight:600;line-height:1.3;">${escapeHtml(text)}</h1>`;
}

/** A paragraph of body text. */
export function paragraph(text, color = '#c9c9c9') {
  return `<p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:${color};">${text}</p>`;
}

/** One key/value row for a details table. */
export function labelRow(label, value) {
  return `<tr>
    <td style="padding:7px 0;font-size:12px;color:#8a8a8a;letter-spacing:0.05em;width:40%;">${escapeHtml(label)}</td>
    <td style="padding:7px 0;font-size:14px;color:#fafafa;text-align:right;width:60%;">${value == null || value === '' ? '—' : value}</td>
  </tr>`;
}

/** Wraps an array of labelRow() strings in a table. */
export function detailTable(rows) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 24px;"><tbody>${rows.join('')}</tbody></table>`;
}

/** A coloured, uppercase status pill. */
export function statusBadge(status) {
  const s = String(status || 'pending').toUpperCase();
  const danger = ['CANCELLED', 'NO_SHOW', 'FAILED', 'REFUNDED'].includes(s);
  const color = danger ? '#b91c1c' : '#D4AF37';
  return `<span style="display:inline-block;padding:4px 10px;font-size:11px;letter-spacing:0.1em;color:${color};border:1px solid ${color};border-radius:2px;">${escapeHtml(s)}</span>`;
}

/** One item row for an order items table. */
export function itemRow({ name, qty, lineTotal }) {
  return `<tr>
    <td style="padding:8px 0;font-size:14px;color:#fafafa;">${escapeHtml(name)}${qty ? ` <span style="color:#8a8a8a;">× ${qty}</span>` : ''}</td>
    <td style="padding:8px 0;font-size:14px;color:#fafafa;text-align:right;">${money(lineTotal)}</td>
  </tr>`;
}

/** Wraps a set of itemRow() strings in a table. */
export function itemsTable(rows) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 12px;"><tbody>${rows.join('')}</tbody></table>`;
}
