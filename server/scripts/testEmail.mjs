/**
 * DEV-ONLY email test script. There is intentionally NO public email endpoint.
 *
 * Run from the repo root (so dotenv picks up the root .env):
 *   node server/scripts/testEmail.mjs [recipient@example.com]
 *
 * Uses the configured SMTP transporter and sends a single branded test message.
 * Safe: it never prints SMTP credentials, only the recipient + outcome.
 */
import { sendEmail, verifyEmailServer } from '../services/email.service.js';
import { config } from '../config/index.js';

// Top-level await is allowed in .mjs.
try {
  const to = process.argv[2] || process.env.TEST_EMAIL_TO || config.email.user;
  if (!to) {
    console.error(
      'No recipient configured.\nUsage: node server/scripts/testEmail.mjs <recipient@example.com>' +
        '\nor set TEST_EMAIL_TO / SMTP_USER.'
    );
    process.exit(1);
  }

  await verifyEmailServer();

  await sendEmail({
    to,
    subject: 'NOIR Salon | Test Email',
    text: 'This is a test email from NOIR Salon. If you can read this, SMTP is working.',
    html:
      '<p style="font-family:Helvetica,Arial,sans-serif;color:#111;">This is a <strong>test email</strong> from NOIR Salon.</p>',
  });

  console.log(`[EMAIL] Test email sent to ${to}`);
} catch (err) {
  console.error('[EMAIL] Test email failed:', err?.message || err);
  process.exit(1);
}
