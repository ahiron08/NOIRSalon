import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsRoot = path.join(__dirname, '..', 'uploads');

/**
 * Upload a buffer/file to Cloudinary when configured, otherwise
 * persist it under /server/uploads (served statically in production).
 *
 * @returns {Promise<{url:string, public_id?:string}>}
 */
export async function uploadMedia(file, { folder = 'noir', resourceType = 'image' } = {}) {
  if (isCloudinaryConfigured() && file.buffer) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: resourceType, overwrite: true },
        (err, result) => {
          if (err) return reject(err);
          resolve({ url: result.secure_url, public_id: result.public_id });
        }
      );
      stream.end(file.buffer);
    });
  }

  // local fallback
  const dir = path.join(uploadsRoot, folder);
  await fs.mkdir(dir, { recursive: true });
  const name = `${Date.now()}-${file.originalname.replace(/[^a-z0-9.]/gi, '_')}`;
  const filePath = path.join(dir, name);
  await fs.writeFile(filePath, file.buffer);
  return { url: `/uploads/${folder}/${name}`, public_id: name };
}

export async function deleteMedia(publicId) {
  if (!publicId) return;
  if (isCloudinaryConfigured()) {
    await cloudinary.uploader.destroy(publicId).catch(() => {});
    return;
  }
  const filePath = path.join(uploadsRoot, publicId);
  await fs.unlink(filePath).catch(() => {});
}

/**
 * Extract a Cloudinary public_id from a secure_url so that an asset can be
 * destroyed later without needing an extra schema field. Returns null for
 * non-Cloudinary URLs (external images, local uploads, Instagram assets).
 *
 *   https://res.cloudinary.com/<cloud>/image/upload/v1234/folder/file.jpg
 *                                                     └──> "folder/file"
 */
export function extractCloudinaryPublicId(url) {
  if (typeof url !== 'string') return null;
  const m = url.match(
    /^https?:\/\/res\.cloudinary\.com\/[^/]+\/(?:image|video)\/upload\/v\d+\/(.+)$/
  );
  if (!m) return null;
  return m[1].replace(/\.[a-z0-9]+$/i, '');
}

/**
 * Delete a Cloudinary asset referenced by its URL. Safe to call with
 * non-Cloudinary or undefined URLs (no-op).
 */
export async function deleteCloudinaryAssetByUrl(url) {
  const publicId = extractCloudinaryPublicId(url);
  if (publicId) await deleteMedia(publicId);
}
