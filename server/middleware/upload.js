import multer from 'multer';
import AppError from '../utils/AppError.js';

/**
 * In-memory multer storage — the buffer is handed to Cloudinary (or the
 * local fallback service) immediately, keeping the app stateless.
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter(_req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Unsupported file type. Please upload an image or MP4/WebM video.', 400));
    }
  },
});

/** Convenience field aliases for common upload points. */
export const uploadImage = upload.single('image');
export const uploadImages = upload.array('images', 12);
export const uploadMediaFile = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 12 },
  { name: 'video', maxCount: 1 },
  { name: 'avatar', maxCount: 1 },
]);
