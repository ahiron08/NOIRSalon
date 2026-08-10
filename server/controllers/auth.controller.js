import crypto from 'node:crypto';
import User from '../models/User.model.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { signToken, cookieOptions } from '../utils/token.js';
import { sendEmail, layout } from '../services/email.service.js';
import { config } from '../config/index.js';

const sendAuthResponse = (res, user, statusCode) => {
  const token = signToken(user._id);
  res.cookie('token', token, cookieOptions());
  user.password = undefined;
  res.status(statusCode).json({ success: true, token, user });
};

/** Register a user (optionally sending a verification email). */
export const register = catchAsync(async (req, res) => {
  const { name, email, phone, password, passwordConfirm } = req.body;
  if (password !== passwordConfirm) throw new AppError('Passwords do not match', 400);

  const user = await User.create({ name, email, phone, password, passwordConfirm });

  try {
    const vToken = user.createVerificationToken();
    await user.save({ validateBeforeSave: false });
    const url = `${config.clientUrl}/verify-email?token=${vToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Verify your NOIR account',
      html: layout(
        `<p style="font-size:15px;color:#fff;">Welcome, ${user.name}. Please verify your email.</p>
         <p><a href="${url}" style="display:inline-block;background:#D4AF37;color:#000;text-decoration:none;padding:12px 24px;letter-spacing:.1em;">Verify Email</a></p>`,
        'Verify your account'
      ),
    });
  } catch (err) {
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.error('[Auth] verification email failed', err.message);
  }

  sendAuthResponse(res, user, 201);
});

/** Login with email + password → JWT in httpOnly cookie + body. */
export const login = catchAsync(async (req, res, next) => {
  const { email, password, remember } = req.body;
  if (!email || !password) return next(new AppError('Please provide email and password.', 400));

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password))) {
    return next(new AppError('Incorrect email or password.', 401));
  }
  if (!user.active) return next(new AppError('This account has been deactivated.', 403));

  sendAuthResponse(res, user, 200);
});

/** Verify an email address from a signed token. */
export const verifyEmail = catchAsync(async (req, res, next) => {
  const hashed = crypto.createHash('sha256').update(req.query.token || '').digest('hex');
  const user = await User.findOne({ verificationToken: hashed, verificationExpires: { $gt: Date.now() } });
  if (!user) return next(new AppError('Verification token invalid or expired.', 400));

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationExpires = undefined;
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, message: 'Email verified. You can now sign in.' });
});

/** Request a password reset link. */
export const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('No account found with that email.', 404));

  const token = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const url = `${config.clientUrl}/reset-password?token=${token}`;
  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your NOIR password',
      html: layout(
        `<p style="font-size:15px;color:#fff;">Reset your password — the link expires in 10 minutes.</p>
         <p><a href="${url}" style="display:inline-block;background:#D4AF37;color:#000;text-decoration:none;padding:12px 24px;letter-spacing:.1em;">Reset Password</a></p>`,
        'Reset password'
      ),
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Could not send reset email. Try again later.', 500));
  }

  res.json({ success: true, message: 'Reset link sent to your email.' });
});

/** Reset password using token. */
export const resetPassword = catchAsync(async (req, res, next) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({ passwordResetToken: hashed, passwordResetExpires: { $gt: Date.now() } });
  if (!user) return next(new AppError('Reset token invalid or expired.', 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendAuthResponse(res, user, 200);
});

/** Active user's profile. */
export const getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
});

/** Update profile fields (name, phone, avatar). */
export const updateMe = catchAsync(async (req, res) => {
  const allowed = ['name', 'phone', 'avatar'];
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) req.user[k] = req.body[k];
  });
  await req.user.save({ validateBeforeSave: true });
  res.json({ success: true, user: req.user });
});

/** Change password (requires old password). */
export const updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.correctPassword(req.body.currentPassword))) {
    return next(new AppError('Current password is incorrect.', 401));
  }
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  await user.save();
  sendAuthResponse(res, user, 200);
});

/** Sign out — clear the cookie. */
export const logout = (_req, res) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 1000), httpOnly: true });
  res.json({ success: true, message: 'Logged out' });
};
