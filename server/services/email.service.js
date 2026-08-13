import nodemailer from 'nodemailer';
import { config } from '../config/index.js';
import { formatDateIST, formatTimeIST } from './availability.service.js';

import appointmentCreated from '../templates/appointment/created.js';
import appointmentConfirmed from '../templates/appointment/confirmed.js';
import appointmentCancelled from '../templates/appointment/cancelled.js';
import appointmentCompleted from '../templates/appointment/completed.js';
import orderCreated from '../templates/order/created.js';
import orderPaymentConfirmed from '../templates/order/paymentConfirmed.js';
import orderProcessing from '../templates/order/processing.js';
import orderCompleted from '../templates/order/completed.js';
import orderCancelled from '../templates/order/cancelled.js';

/**
 * Transactional email service.
 *
 * When SMTP credentials are configured we build a reusable Nodemailer
 * transporter. Otherwise we fall back to a benign console "preview" transport
 * so development never crashes on mail and developers can see what would be
 * sent. Emails are a notification side effect: a failure is logged and never
 * rolls back the business operation that triggered it.
 */
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const { host, port, secure, user, pass } = config.email;
  if (host && user) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
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
 *
 * Throws on SMTP failure; callers should use a higher-level `send*Email`
 * helper (via `dispatch`) which handles + logs failures.
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

/**
 * Verify the SMTP transporter once. Useful in dev / the test script. Never
 * called per-email, only on demand.
 */
export async function verifyEmailServer() {
  const tr = getTransporter();
  if (typeof tr.verify === 'function') {
    await tr.verify();
    console.log('[EMAIL] SMTP transporter verified OK');
    return true;
  }
  console.log('[EMAIL] Dev preview transport active — no SMTP verification performed');
  return false;
}

/**
 * Central dispatch: send one composed email, logging the outcome. Never throws —
 * a failure is logged so the business operation is unaffected.
 */
async function dispatch(event, to, { subject, text, html }) {
  if (!to) {
    console.warn(`[EMAIL] ${event}: skipped (no recipient)`);
    return null;
  }
  console.log(`[EMAIL] Sending ${event} to ${to}`);
  try {
    const mail = await sendEmail({ to, subject, text, html });
    console.log(`[EMAIL] ${event} sent to ${to} (${mail?.messageId || 'ok'})`);
    return mail;
  } catch (err) {
    console.error(`[EMAIL] Failed to send ${event} to ${to}:`, err?.message || err);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Recipient + display-context resolution                              */
/* ------------------------------------------------------------------ */

/** Resolve the persisted customer email for an appointment (guest or user). */
function appointmentEmail(apt) {
  return apt?.guestEmail || apt?.user?.email || null;
}

/** Build the display context used by appointment templates. */
function appointmentContext(apt) {
  const snapshots = apt?.serviceSnapshots || [];
  const refs = apt?.services || [];
  const serviceLabel =
    snapshots.map((s) => s?.name).filter(Boolean).join(', ') ||
    refs.map((s) => s?.name).filter(Boolean).join(', ') ||
    'Salon service';

  const start = apt?.startTime || apt?.date;
  const end = apt?.endTime;

  return {
    name: apt?.guestName || apt?.user?.name || 'Valued Customer',
    service: serviceLabel,
    stylist: apt?.stylistName || apt?.stylist?.name || 'Our salon',
    date: formatDateIST(start),
    time: end ? `${formatTimeIST(start)} – ${formatTimeIST(end)}` : formatTimeIST(start),
    duration: apt?.duration,
    status: apt?.status || 'pending',
    notes: apt?.notes,
    cancelReason: apt?.cancelReason,
    id: apt?._id,
  };
}

/** Resolve the persisted customer email for an order (guest or user). */
function orderEmail(order) {
  return order?.guestEmail || order?.user?.email || null;
}

/** Build the display context used by order templates. */
function orderContext(order) {
  return {
    name: order?.user?.name || 'Valued Customer',
    id: order?._id,
    items: (order?.items || []).map((i) => ({
      name: i?.name || i?.product?.name || 'Item',
      qty: i?.quantity,
      price: i?.price,
    })),
    subtotal: order?.subtotal,
    couponCode: order?.couponCode,
    couponDiscount: order?.couponDiscount,
    deliveryFee: order?.deliveryFee,
    tax: order?.tax,
    total: order?.total,
    paymentStatus: order?.paymentStatus,
    status: order?.status,
  };
}

/* ------------------------------------------------------------------ */
/* High-level appointment emails                                       */
/* ------------------------------------------------------------------ */

export function sendAppointmentCreatedEmail(apt) {
  return dispatch('appointment created', appointmentEmail(apt), appointmentCreated(appointmentContext(apt)));
}

export function sendAppointmentConfirmedEmail(apt) {
  return dispatch('appointment confirmation', appointmentEmail(apt), appointmentConfirmed(appointmentContext(apt)));
}

export function sendAppointmentCancelledEmail(apt) {
  return dispatch('appointment cancellation', appointmentEmail(apt), appointmentCancelled(appointmentContext(apt)));
}

export function sendAppointmentCompletedEmail(apt) {
  return dispatch('appointment completion', appointmentEmail(apt), appointmentCompleted(appointmentContext(apt)));
}

/* ------------------------------------------------------------------ */
/* High-level order emails                                             */
/* ------------------------------------------------------------------ */

export function sendOrderCreatedEmail(order) {
  return dispatch('order created', orderEmail(order), orderCreated(orderContext(order)));
}

export function sendOrderPaymentConfirmedEmail(order) {
  return dispatch('payment confirmation', orderEmail(order), orderPaymentConfirmed(orderContext(order)));
}

export function sendOrderProcessingEmail(order) {
  return dispatch('order processing', orderEmail(order), orderProcessing(orderContext(order)));
}

export function sendOrderCompletedEmail(order) {
  return dispatch('order completion', orderEmail(order), orderCompleted(orderContext(order)));
}

export function sendOrderCancelledEmail(order) {
  return dispatch('order cancellation', orderEmail(order), orderCancelled(orderContext(order)));
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
