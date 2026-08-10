import { v2 as cloudinary } from 'cloudinary';
import { config } from './index.js';

/**
 * Cloudinary media storage. Uploads only happen when credentials exist;
 * otherwise the app gracefully falls back to direct multer disk storage.
 */
let configured = false;
export function configureCloudinary() {
  const { cloudName, apiKey, apiSecret } = config.cloudinary;
  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('[Cloudinary] credentials missing — using local media storage.');
    return false;
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  configured = true;
  return true;
}

export const isCloudinaryConfigured = () => configured;

export { cloudinary };
