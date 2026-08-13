import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  host: process.env.HOST || (process.env.NODE_ENV === 'production' ? '127.0.0.1' : '0.0.0.0'),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:5000/api/v1',

  mongoUri: process.env.MONGODB_URI,

  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieExpiresIn:
      Number(process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000,
  },

  admin: {
    name: process.env.ADMIN_NAME || 'NOIR Admin',
    email: process.env.ADMIN_EMAIL || 'admin@noirsalon.in',
    password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
  },

  email: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    // secure: true for implicit TLS on port 465; default to port-465 heuristic
    // when SMTP_SECURE is not set, otherwise accept an explicit boolean.
    secure:
      process.env.SMTP_SECURE !== undefined && process.env.SMTP_SECURE !== ''
        ? String(process.env.SMTP_SECURE).toLowerCase() === 'true'
        : Number(process.env.SMTP_PORT) === 465,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM || 'NOIR SALON <no-reply@noirsalon.in>',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  payment: {
    provider: process.env.PAYMENT_PROVIDER || 'cash', // cash | razorpay | stripe | giftcard | upi
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    upi: {
      id: process.env.UPI_ID,
      businessName: process.env.UPI_BUSINESS_NAME || 'NOIR SALON',
      merchantId: process.env.UPI_MERCHANT_ID,
      currency: process.env.UPI_CURRENCY || 'INR',
    },
  },

  google: {
    placesApiKey: process.env.GOOGLE_PLACES_API_KEY,
    mapEmbed: process.env.GOOGLE_MAP_EMBED,
  },

  // Salon operations. There is no existing working-hours system, so we define a
  // clear, env-configurable default. The defaults (10:00–19:00 with a 30-minute
  // booking grid) match the working hours already implied by the existing booking
  // UI. Override via SALON_OPEN_TIME / SALON_CLOSE_TIME / SALON_SLOT_INTERVAL_MINUTES.
  salon: {
    timezone: process.env.SALON_TIMEZONE || 'Asia/Kolkata',
    openTime: process.env.SALON_OPEN_TIME || '10:00',
    closeTime: process.env.SALON_CLOSE_TIME || '19:00',
    slotIntervalMinutes: Number(process.env.SALON_SLOT_INTERVAL_MINUTES) || 30,
  },
};
