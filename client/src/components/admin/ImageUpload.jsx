import { useRef, useState } from 'react';
import { uploadAdminImage } from '../../services/api.js';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPT_ATTR = 'image/png,image/jpeg,image/webp';

/**
 * Admin image upload control. Uploads the chosen file to the backend
 * /admin/upload endpoint (which pushes to Cloudinary) and, on success, calls
 * `onChange` with the returned secure URL. Shows a live preview, a loading
 * state during upload, and clear error messages for rejected files.
 *
 * Props:
 *  - value: string   current image URL (may be empty)
 *  - onChange(url)   receives the new URL on successful upload / removal
 *  - label: string   optional field label
 */
export default function ImageUpload({ value = '', onChange, label = 'Image', required = false }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so re-selecting the same file still triggers change.
    if (inputRef.current) inputRef.current.value = '';
    setError('');
    setPreview('');

    if (!ACCEPTED.includes(file.type)) {
      setError('Please choose a JPG, PNG or WEBP image.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('Image must be smaller than 5MB.');
      return;
    }

    // Show a local preview while uploading.
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const { url } = await uploadAdminImage(file);
      onChange(url);
    } catch (err) {
      setError(err.message || 'Image upload failed. Please try again.');
      setPreview('');
    } finally {
      setUploading(false);
    }
  };

  const currentSrc = preview || value;

  return (
    <div>
      {label && (
        <div className="mb-2 text-xs uppercase tracking-[0.2em] text-noir-muted">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="w-24 h-24 border border-white/20 bg-black overflow-hidden flex items-center justify-center shrink-0">
          {currentSrc ? (
            <img src={currentSrc} alt={label} className="w-full h-full object-cover" />
          ) : (
            <span className="text-noir-muted text-xs">No image</span>
          )}
        </div>

        <div className="space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT_ATTR}
            onChange={handleFile}
            className="hidden"
            id={`upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
          />
          <label
            htmlFor={`upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
            className={`inline-block cursor-pointer border border-noir-gold/60 px-4 py-2 text-xs uppercase tracking-[0.2em] text-noir-gold hover:bg-noir-gold hover:text-black transition-all duration-300 ${
              uploading ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            {uploading ? 'Uploading...' : value ? 'Replace Image' : 'Upload Image'}
          </label>

          {(value || preview) && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setPreview('');
              }}
              className="block text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Remove image
            </button>
          )}
        </div>
      </div>

      {uploading && (
        <p className="mt-2 text-xs text-noir-gold">Uploading to Cloudinary...</p>
      )}
      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
