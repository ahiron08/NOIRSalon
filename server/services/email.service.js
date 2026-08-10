import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

/**
 * Transactional email service.
 * Falls back to a benign "ethereal"-style console transport when no SMTP
 * credentials are configured, so development never crashes on mail.
 */
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const { host, port, user, pass } = config.email;
  if (host && user) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  } else {
    // dev-only preview transport
    transporter = {
      sendMail: async (opts) => {
        console.log('\n[Email:dev] to=%s subject=%s\n%s\n', opts.to, opts.subject, opts.html || opts.text);
        return { messageId: 'dev-preview' };
      },
    };
  }
  return transporter;
}

/**
 * @param {object} opts
 * @param {string} opts.to
 * @param {string} opts.subject
 * @param {string} [opts.text]
 * @param {string} [opts.html]
 */
export async function sendEmail({ to, subject, text, html }) {
  const mail = await getTransporter().sendMail({
    from: config.email.from,
    to,
    subject,
    text,
    html,
  });
  return mail;
}

/** Minimal shared HTML shell so all mail matches the brand. */
export function layout(body, title = 'NOIR SALON') {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#000;color:#fff;font-family:Georgia,serif;">
    <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
      <div style="text-align:center;letter-spacing:.4em;font-size:22px;color:#D4AF37;">NOIR</div>
      <div style="height:1px;background:#D4AF37;margin:20px 0 32px;"></div>
      ${body}
      <p style="margin-top:40px;font-size:12px;color:#A1A1AA;line-height:1.8;">
        NOIR SALON — East India's Largest Luxury Salon<br/>Guwahati, Assam
      </p>
    </div>
  </body>
</html>`;
}
