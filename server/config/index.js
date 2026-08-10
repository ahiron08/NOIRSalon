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
    provider: process.env.PAYMENT_PROVIDER || 'cash', // cash | razorpay | stripe | giftcard
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  },

  google: {
    placesApiKey: process.env.GOOGLE_PLACES_API_KEY,
    mapEmbed: process.env.GOOGLE_MAP_EMBED,
  },
};
