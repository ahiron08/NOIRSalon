import Contact from '../models/Contact.model.js';
import Newsletter from '../models/Newsletter.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import { sendEmail, layout } from '../services/email.service.js';

/** Public contact form → saved + emailed to the salon inbox. */
export const submitContact = catchAsync(async (req, res) => {
  const { name, email, phone, subject, message, topic } = req.body;

  const doc = await Contact.create({ name, email, phone, subject, message, topic });

  try {
    await sendEmail({
      to: process.env.CONTACT_EMAIL || process.env.ADMIN_EMAIL || 'hello@noirsalon.in',
      subject: `New enquiry: ${subject || 'General'}`,
      html: layout(
        `<p style="font-size:15px;color:#fff;">New enquiry from <strong>${name}</strong> (${email})</p>
         <p style="color:#A1A1AA;">${message}</p>`,
        'New contact enquiry'
      ),
    });
  } catch (e) {
    console.error('[Contact] notification email failed', e.message);
  }

  res.status(201).json({ success: true, message: 'Message received. We will be in touch.', data: doc });
});

/** Admin: list contacts with pagination/filtering. */
export const listContacts = catchAsync(async (req, res) => {
  const data = await Contact.find().sort('-createdAt');
  res.json({ success: true, count: data.length, data });
});

export const updateContact = catchAsync(async (req, res, next) => {
  const doc = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!doc) return next(new AppError('Contact not found.', 404));
  res.json({ success: true, data: doc });
});

export const deleteContact = catchAsync(async (req, res, next) => {
  const doc = await Contact.findByIdAndDelete(req.params.id);
  if (!doc) return next(new AppError('Contact not found.', 404));
  res.json({ success: true, message: 'Deleted' });
});

/** Newsletter subscribe — idempotent, unsubscribes update state. */
export const subscribe = catchAsync(async (req, res) => {
  const { email, name } = req.body;

  const existing = await Newsletter.findOne({ email });
  if (existing) {
    if (!existing.subscribed) {
      existing.subscribed = true;
      existing.unsubscribedAt = undefined;
      await existing.save();
    }
    return res.status(200).json({ success: true, message: 'You are already subscribed.' });
  }

  await Newsletter.create({ email, name: name || undefined });
  try {
    await sendEmail({
      to: email,
      subject: 'Welcome to NOIR — luxury in your inbox',
      html: layout(
        `<p style="font-size:15px;color:#fff;">Welcome to the NOIR circle. Expect only the refined.</p>`,
        'Welcome'
      ),
    });
  } catch (e) {
    console.error('[Newsletter] welcome email failed', e.message);
  }

  res.status(201).json({ success: true, message: 'Subscribed successfully.' });
});

export const unsubscribe = catchAsync(async (req, res) => {
  const doc = await Newsletter.findOneAndUpdate(
    { email: req.query.email },
    { subscribed: false, unsubscribedAt: new Date() },
    { new: true }
  );
  res.json({ success: true, message: 'Unsubscribed.', data: doc });
});
